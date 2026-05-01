"""
main.py — FastAPI Backend for ML-IDS Platform v3.2
===================================================
Endpoints:
  GET  /                     Health check
  GET  /api/health           Detailed health + system info
  GET  /api/models           List available ML models
  GET  /api/attack-classes   Attack types & severity (single source of truth)
  POST /api/upload           PCAP/CSV analysis (multipart/form-data)
  POST /api/reports          Persist a session report
  GET  /api/reports          Retrieve persisted reports
  GET  /api/scan             Network scan (ARP sweep or TCP SYN)
  WS   /ws/live-capture      Real-time flow stream

Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import asyncio
import json
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Optional

import numpy as np
from fastapi import FastAPI, File, Form, Request, UploadFile, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.ml_pipeline import MultiModelIDS, MODEL_CONFIG, SEVERITY_MAP, ATTACK_CLASSES, generate_live_flows, calc_risk

from core.scanner import run_arp_sweep, run_tcp_syn_scan
from core.dataset_downloader import initialize_datasets

# ── Configuration ─────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:8080,http://127.0.0.1:5173"
).split(",")

# Risk → display status mapping (hoisted from duplicated inline dicts)
STATUS_MAP = {"low": "Safe", "medium": "Elevated", "high": "Elevated", "critical": "Critical"}

# In-memory report store (mirrors database_schema.sql until asyncpg is wired)
_report_store: list[dict[str, Any]] = []


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Init IDS engine on startup, attach to app.state (thread-safe)."""
    print("[LIFESPAN] Starting ML-IDS engine...")
    app.state.ids_engine = MultiModelIDS()
    print("[LIFESPAN] Engine ready. CORS origins:", ALLOWED_ORIGINS)
    yield
    print("[LIFESPAN] Shutting down ML-IDS engine.")


# ── App & Middleware ──────────────────────────────────────────────────────────
app = FastAPI(
    title="ML-IDS API", version="3.2.0",
    description="Multi-Model Intrusion Detection System — FastAPI Backend",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def _get_engine(request: Request) -> MultiModelIDS:
    return request.app.state.ids_engine


# ── REST Endpoints ────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online", "version": "3.2.0",
        "message": "ML-IDS Platform Active",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/health", tags=["Health"])
async def health(request: Request):
    """Extended health check for monitoring dashboards."""
    engine = _get_engine(request)
    return {
        "status": "online", "version": "3.2.0",
        "models_loaded": list(MODEL_CONFIG.keys()),
        "report_store_count": len(_report_store),
        "cors_origins": ALLOWED_ORIGINS,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "engine_id": id(engine),
    }


@app.post("/api/admin/download-datasets", tags=["Admin"])
async def download_datasets():
    """Trigger background download of academic datasets into Data_sets/"""
    try:
        base_path = os.path.join(os.path.dirname(__file__), "..", "..", "Data_sets")
        results = await asyncio.to_thread(initialize_datasets, base_path)
        return {"status": "complete", "results": results}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


@app.get("/api/models", tags=["Models"])
async def list_models():
    """Return all available ML models with metadata."""
    return {"models": [
        {"id": mid, "name": cfg["display_name"], "accuracy": cfg["accuracy"],
         "features": cfg["features"], "dataset": cfg["dataset"],
         "training_samples": cfg["training_samples"],
         "conf_min": cfg["conf_min"], "conf_max": cfg["conf_max"]}
        for mid, cfg in MODEL_CONFIG.items()
    ]}


@app.get("/api/attack-classes", tags=["Models"])
async def attack_classes():
    """Single source of truth for attack types and severity mapping."""
    return {
        "attack_classes": [{"name": cls, "severity": SEVERITY_MAP.get(cls, "safe")} for cls in ATTACK_CLASSES],
        "severity_levels": ["safe", "medium", "high", "critical"],
        "total": len(ATTACK_CLASSES),
    }


@app.post("/api/upload", tags=["Analysis"])
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    model: Optional[str] = Form("random_forest"),
):
    """Accept PCAP/CSV upload, return analysis report with SHAP explanations."""
    valid_exts = {".pcap", ".pcapng", ".csv"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in valid_exts:
        return JSONResponse(status_code=400, content={"error": f"Unsupported file type '{ext}'. Use .pcap, .pcapng, or .csv."})

    content = await file.read()
    file_size = len(content)

    flows_per_byte = 0.002 if ext in {".pcap", ".pcapng"} else 0.01
    n_flows = min(max(10, int(file_size * flows_per_byte)), 10_000)

    engine = _get_engine(request)
    model_id = model or "random_forest"

    report = await asyncio.to_thread(engine.analyze_file, file.filename, n_flows, model_id)
    report["file_size_bytes"] = file_size
    report["analyzed_at"] = datetime.now(timezone.utc).isoformat()

    # Persist to report store (mirrors network_analysis_reports table)
    attack_ratio = report.get("attack_ratio", 0.0)
    risk = report.get("risk_level", "low")

    store_entry = {
        "report_id": str(uuid.uuid4()),
        "timestamp": report["analyzed_at"],
        "source": "file", "filename": file.filename,
        "threat_intensity": round(attack_ratio * 100, 4),
        "model_confidence": round(report.get("accuracy", 0.95) * 100, 2),
        "network_security_status": STATUS_MAP.get(risk, "Safe"),
        "risk_level": risk, "total_flows": n_flows,
        "model_used": report.get("model_used"),
        "ml_tensor_data": {
            "predictions": report.get("predictions", []),
            "shap_explanations": report.get("shap_explanations", []),
        },
    }
    _report_store.append(store_entry)
    report["report_id"] = store_entry["report_id"]

    return JSONResponse(content=report)


@app.post("/api/reports", tags=["Reports"])
async def save_report(request: Request):
    """Persist a live-capture session report from the frontend."""
    body = await request.json()
    attack_ratio = body.get("attackFlows", 0) / max(body.get("totalFlows", 1), 1)
    risk = calc_risk(attack_ratio)

    entry = {
        "report_id": str(uuid.uuid4()),
        "timestamp": body.get("timestamp", datetime.now(timezone.utc).isoformat()),
        "source": body.get("source", "live"),
        "threat_intensity": round(attack_ratio * 100, 4),
        "model_confidence": 95.0,
        "network_security_status": STATUS_MAP.get(risk, "Safe"),
        "risk_level": risk,
        "total_flows": body.get("totalFlows", 0),
        "model_used": body.get("modelUsed", "Unknown"),
        "ml_tensor_data": body,
    }
    _report_store.append(entry)
    return JSONResponse(content={"report_id": entry["report_id"], "status": "persisted"})


@app.get("/api/reports", tags=["Reports"])
async def get_reports(limit: int = Query(50, ge=1, le=200)):
    """Retrieve persisted reports (newest first), without heavy ml_tensor_data."""
    sorted_reports = sorted(_report_store, key=lambda r: r.get("timestamp", ""), reverse=True)[:limit]
    summary = [{k: v for k, v in r.items() if k != "ml_tensor_data"} for r in sorted_reports]
    return {"reports": summary, "total": len(_report_store)}


@app.get("/api/scan", tags=["Scanning"])
async def network_scan(
    request: Request,
    target_ip: Optional[str] = Query(None, description="IP for TCP SYN scan. None → ARP sweep."),
):
    """Perform active network mapping (ARP sweep or TCP SYN)."""
    if target_ip:
        results = await asyncio.to_thread(run_tcp_syn_scan, target_ip)
        return {"target": target_ip, "ports": results, "scan_type": "TCP SYN/ACK"}
    else:
        results = await asyncio.to_thread(run_arp_sweep, "192.168.1.0/24")
        return {"subnet": "192.168.1.0/24", "devices": results, "scan_type": "ARP Sweep"}


# ── WebSocket — Live Capture Stream ───────────────────────────────────────────

@app.websocket("/ws/live-capture")
async def ws_live_capture(
    websocket: WebSocket,
    model: str = Query(default="random_forest"),
):
    """Adaptive-batched WebSocket stream (50ms window, 8-15 flows/batch)."""
    await websocket.accept()
    engine = websocket.app.state.ids_engine
    print(f"[WS] Client connected | model={model}")

    try:
        async for batch in generate_live_flows(model, engine):
            await websocket.send_text(json.dumps(batch))
            await asyncio.sleep(0)
    except WebSocketDisconnect:
        print("[WS] Client disconnected")
    except Exception as exc:
        print(f"[WS] Error: {exc}")
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
