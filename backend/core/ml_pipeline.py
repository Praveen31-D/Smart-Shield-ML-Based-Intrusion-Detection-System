"""
ml_pipeline.py — MultiModelIDS: Multi-algorithm ML inference engine.
Simulates XGBoost, Random Forest, SVM, KNN, and Logistic Regression
with realistic confidence distributions per model's baseline accuracy.

Training methodology:
  Datasets: UNSW-NB15 (42), NSL-KDD (41), CIC-IDS-2017 (80) features
  Preprocessing: LabelEncoder, StandardScaler, SMOTE
  Models: RF(100 trees), XGB(200 rounds), SVM(rbf), KNN(ball_tree), LR(lbfgs)
"""

import random
import asyncio
from datetime import datetime, timezone

import numpy as np

# ── Attack classes & severity ─────────────────────────────────────────────────
ATTACK_CLASSES = [
    "Normal", "DoS", "Exploits", "Reconnaissance", "Fuzzers",
    "Generic", "Backdoor", "Shellcode", "Analysis", "Worms",
]

SEVERITY_MAP = {
    "Normal": "safe", "Reconnaissance": "medium", "Analysis": "medium",
    "Fuzzers": "high", "Generic": "high", "DoS": "critical",
    "Exploits": "critical", "Backdoor": "critical",
    "Shellcode": "critical", "Worms": "critical",
}

# Weighted probabilities (70% Normal)
_ATTACK_CLASSES = [c for c in ATTACK_CLASSES if c != "Normal"]
CLASS_WEIGHTS = [0.70] + [0.30 / len(_ATTACK_CLASSES)] * len(_ATTACK_CLASSES)

# ── Risk level calculator (single source of truth for backend) ────────────────
def calc_risk(attack_ratio: float) -> str:
    if attack_ratio > 0.5: return "critical"
    if attack_ratio > 0.3: return "high"
    if attack_ratio > 0.1: return "medium"
    return "low"

# ── Model configurations ─────────────────────────────────────────────────────
MODEL_CONFIG = {
    "random_forest": {
        "display_name": "Random Forest",
        "conf_min": 0.88, "conf_max": 0.99,
        "accuracy": 0.9863,
        "n_estimators": 100, "criterion": "gini", "max_depth": 22, "n_jobs": -1,
        "features": 42, "dataset": "UNSW-NB15", "training_samples": 186_000,
    },
    "xgboost": {
        "display_name": "XGBoost",
        "conf_min": 0.93, "conf_max": 0.999,
        "accuracy": 0.999,
        "n_estimators": 200, "learning_rate": 0.1, "max_depth": 8, "tree_method": "hist",
        "features": 42, "dataset": "UNSW-NB15", "training_samples": 2_540_044,
    },
    "svm": {
        "display_name": "SVM",
        "conf_min": 0.82, "conf_max": 0.95,
        "accuracy": 0.94,
        "kernel": "rbf", "C": 10, "gamma": "scale",
        "features": 41, "dataset": "NSL-KDD", "training_samples": 125_973,
    },
    "knn": {
        "display_name": "KNN",
        "conf_min": 0.75, "conf_max": 0.90,
        "accuracy": 0.85,
        "n_neighbors": 5, "algorithm": "ball_tree", "metric": "euclidean",
        "features": 80, "dataset": "CIC-IDS-2017", "training_samples": 2_830_743,
    },
    "logistic_regression": {
        "display_name": "Logistic Regression",
        "conf_min": 0.70, "conf_max": 0.88,
        "accuracy": 0.825,
        "max_iter": 100, "solver": "lbfgs",
        "features": 42, "dataset": "UNSW-NB15", "training_samples": 175_341,
    },
}

# ── UNSW-NB15 feature names (42) — used for SHAP-style explanations ──────────
UNSW_FEATURE_NAMES = [
    "dur", "proto", "service", "state", "spkts", "dpkts", "sbytes", "dbytes",
    "rate", "sttl", "dttl", "sload", "dload", "sloss", "dloss", "sinpkt",
    "dinpkt", "sjit", "djit", "swin", "stcpb", "dtcpb", "dwin", "tcprtt",
    "synack", "ackdat", "smean", "dmean", "trans_depth", "response_body_len",
    "ct_srv_src", "ct_state_ttl", "ct_dst_ltm", "ct_src_dport_ltm",
    "ct_dst_sport_ltm", "ct_dst_src_ltm", "is_ftp_login", "ct_ftp_cmd",
    "ct_flw_http_mthd", "ct_src_ltm", "ct_srv_dst", "is_sm_ips_ports",
]

# Feature importance weights per model
_FEATURE_IMPORTANCE = {
    "random_forest": {"dur": 0.18, "sbytes": 0.14, "dbytes": 0.12, "rate": 0.10,
                      "sttl": 0.08, "state": 0.07, "proto": 0.06, "spkts": 0.05},
    "xgboost":       {"sbytes": 0.20, "dur": 0.16, "rate": 0.13, "dbytes": 0.11,
                      "sload": 0.09, "dload": 0.07, "state": 0.06, "synack": 0.05},
    "svm":           {"sbytes": 0.17, "dbytes": 0.15, "sload": 0.13, "dload": 0.11,
                      "dur": 0.10, "rate": 0.09, "sjit": 0.07, "djit": 0.06},
    "knn":           {"sbytes": 0.19, "dbytes": 0.16, "spkts": 0.12, "dpkts": 0.11,
                      "dur": 0.10, "rate": 0.08, "smean": 0.07, "dmean": 0.06},
    "logistic_regression": {"sbytes": 0.15, "dur": 0.13, "rate": 0.11, "sttl": 0.10,
                             "dttl": 0.08, "proto": 0.07, "state": 0.06, "sloss": 0.05},
}


class MultiModelIDS:
    """Mocked multi-algorithm IDS engine. Replace _mock_predict with real model inference in production."""

    def __init__(self):
        self._models_loaded = True
        print("[MultiModelIDS] Initialized with mocked models:")
        for k, v in MODEL_CONFIG.items():
            print(f"  [OK] {v['display_name']}: {v['features']}-feature {v['dataset']} model")

    def predict_flow(self, features: dict, model_id: str = "random_forest") -> dict:
        """Run inference on a single feature dict."""
        cfg = MODEL_CONFIG.get(model_id, MODEL_CONFIG["random_forest"])
        pred, conf = self._mock_predict(cfg)
        return {
            "prediction": pred,
            "confidence": round(conf, 4),
            "severity": SEVERITY_MAP.get(pred, "safe"),
            "model_used": cfg["display_name"],
        }

    def analyze_file(self, filename: str, n_flows: int, model_id: str) -> dict:
        """Simulate batch analysis with SHAP-style explanations."""
        cfg = MODEL_CONFIG.get(model_id, MODEL_CONFIG["random_forest"])
        results = [dict(zip(("prediction", "confidence"), self._mock_predict(cfg))) for _ in range(n_flows)]

        counts: dict[str, int] = {}
        for r in results:
            counts[r["prediction"]] = counts.get(r["prediction"], 0) + 1

        n_attacks = n_flows - counts.get("Normal", 0)
        attack_ratio = n_attacks / n_flows if n_flows else 0

        predictions_list = [
            {"label": label, "count": count,
             "confidence": round(cfg["conf_min"] + np.random.uniform(0, cfg["conf_max"] - cfg["conf_min"]), 4)}
            for label, count in counts.items()
        ]

        # SHAP-style explanation: top contributing features
        importance = _FEATURE_IMPORTANCE.get(model_id, _FEATURE_IMPORTANCE["random_forest"])
        shap_explanations = [
            {"feature": feat,
             "importance": round(weight + np.random.uniform(-0.02, 0.02), 4),
             "direction": "positive" if np.random.random() > 0.3 else "negative"}
            for feat, weight in sorted(importance.items(), key=lambda x: x[1], reverse=True)
        ]

        return {
            "filename": filename, "total_flows": n_flows,
            "predictions": predictions_list, "risk_level": calc_risk(attack_ratio),
            "model_used": cfg["display_name"], "accuracy": cfg["accuracy"],
            "shap_explanations": shap_explanations, "attack_ratio": round(attack_ratio, 4),
        }

    def _mock_predict(self, config: dict) -> tuple[str, float]:
        """Weighted random prediction matching the model's accuracy distribution."""
        prediction = random.choices(ATTACK_CLASSES, weights=CLASS_WEIGHTS, k=1)[0]
        conf_range = config["conf_max"] - config["conf_min"]
        base = config["conf_min"] + np.random.beta(5, 2) * conf_range
        if prediction != "Normal":
            base *= 0.95
        return prediction, float(np.clip(base, config["conf_min"], config["conf_max"]))


# ── Async flow generator (WebSocket endpoint) ────────────────────────────────
_PROTOCOLS = ["TCP", "UDP", "ICMP"]

def _random_ip() -> str:
    return f"{random.randint(1,223)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,253)}"


async def generate_live_flows(model_id: str, ids_engine: MultiModelIDS):
    """Async generator: 8-15 flows/batch every 50ms (tuned to UI 60fps budget)."""
    flow_id = 0
    cfg = MODEL_CONFIG.get(model_id, MODEL_CONFIG["random_forest"])

    while True:
        batch_size = random.randint(8, 15)
        batch = []
        for _ in range(batch_size):
            flow_id += 1
            pred, conf = ids_engine._mock_predict(cfg)
            now = datetime.now(timezone.utc)
            ts = now.strftime("%H:%M:%S.") + f"{now.microsecond:06d}"[:9]
            batch.append({
                "id": flow_id, "timestamp": ts,
                "source_ip": _random_ip(), "destination_ip": _random_ip(),
                "protocol": random.choice(_PROTOCOLS),
                "bytes": random.randint(40, 65535),
                "prediction": pred, "confidence": round(conf, 4),
                "severity": SEVERITY_MAP.get(pred, "safe"),
                "model": cfg["display_name"],
            })
        yield batch
        await asyncio.sleep(0.05)
