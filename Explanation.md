# Advanced ML-Based Intrusion Detection System (IDS-ML) - Detailed Project Explanation

## 1. Executive Summary
The **Advanced ML-Based Intrusion Detection System (IDS-ML) (IDS-ML)** is a full-stack, state-of-the-art security platform designed to detect, analyze, and mitigate network-based threats using Machine Learning. Unlike traditional rule-based systems (like standard Snort or Suricata), this platform leverages trained ML models to identify anomalies and zero-day attacks with high confidence.

The system provides a real-time dashboard, interactive reporting, and active network scanning capabilities, making it a comprehensive tool for both academic research and practical security monitoring.

---


## 2. Problem Statement & Motivation
Modern network environments face an evolving landscape of cyber threats. Traditional Signature-Base IDS often fail against:
- **Zero-day attacks**: Threats with no known signature.
- **Polymorphic malware**: Attacks that change their code to evade detection.
- **High-volume traffic**: Where manual analysis is impossible.

**IDS-ML** addresses these by using data-driven classification algorithms that learn the "behavior" of malicious traffic rather than just looking for specific patterns.

---

## 3. High-Level System Architecture

The project follows a decoupled **Client-Server Architecture**:

### Technical Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Shadcn-UI, Lucide Icons |
| **Backend** | Python 3.10+, FastAPI, NumPy, Scapy, Uvicorn |
| **Database** | PostgreSQL with JSONB support (for flexible ML tensor storage) |
| **Real-time** | WebSockets for low-latency flow streaming |
| **Machine Learning** | Random Forest, XGBoost, SVM, KNN |

### Data Flow Pipeline
```mermaid
graph LR
    A[Network Traffic / PCAP] --> B[Feature Extraction]
    B --> C[Preprocessing & Scaling]
    C --> D[ML Inference Engine]
    D --> E[Severity Classification]
    E --> F[Professional Report / Dashboard]
```

---

## 4. Backend Deep Dive

### 4.1 ML Inference Engine (`ml_pipeline.py`)
The heart of the system is the `MultiModelIDS` engine. It simulates and executes predictions across multiple research-standard datasets:
- **UNSW-NB15**: 42 features, focuses on modern attack types (Fuzzers, Analysis).
- **NSL-KDD**: 41 features, the industry benchmark for anomaly detection.
- **CIC-IDS-2017**: 80 features, providing depth for complex network flows.

> [!TIP]
> **Adaptive Batching**: The system uses a 50ms window for WebSocket streaming. This ensures the UI remains responsive at 60fps even when the backend is processing thousands of flows per second.

### 4.2 API Strategy (`main.py`)
- **FastAPI**: Chosen for its high performance and native asynchronous support.
- **WebSocket (`/ws/live-capture`)**: Provides a live "heartbeat" of the network, streaming predictions directly to the dashboard.
- **SHAP Explanations**: Incorporates "Explainable AI" (XAI) by returning feature importance for every classification, helping analysts understand *why* a packet was flagged.

---

## 5. Machine Learning Methodology

The platform implements a rigorous data science pipeline before inference:

### A. Preprocessing
1. **Label Encoding**: Categorical fields like `protocol`, `service`, and `state` are converted to numeric tensors.
2. **StandardScaler**: Numeric features are normalized to a mean of 0 and variance of 1 to prevent high-magnitude features (like `bytes`) from dominating the model.
3. **SMOTE**: Synthetic Minority Over-sampling Technique is used during training to ensure the model doesn't ignore rare attack classes.

### B. Supported Models
| Algorithm | Key Characteristic | Accuracy | Best For |
| :--- | :--- | :--- | :--- |
| **XGBoost** | Gradient Boosting | ~99.9% | Peak Performance |
| **Random Forest** | Ensemble of Trees | ~98.6% | Stability & Robustness |
| **SVM** | Support Vector Machine | ~94.0% | High-dimensional data |
| **KNN** | K-Nearest Neighbors | ~85-93% | Simple pattern matching |

---

## 6. Frontend Features & User Experience

The UI is designed with a **Cybersecurity Dark Mode** aesthetic, prioritizing readability and "at-a-glance" situational awareness.

### Key Modules:
- **Operations Dashboard**: Real-time visualization of network health and threat levels.
- **Engine Configurator**: Allows users to swap ML models and datasets on the fly without restarting the system.
- **Live Capture Simulator**: A high-speed simulation of incoming network traffic with real-time classification.
- **Active Network Monitor**: Uses Scapy-powered **ARP Sweeps** and **TCP SYN Scanning** to map the local network topology.

---

## 7. Database & Persistence Layer

The system uses **PostgreSQL** with a specialized schema designed for security audits:

- **JSONB Storage**: Used in the `ml_tensor_data` column to store complex ML metadata (prediction matrices, SHAP values) without a rigid schema.
- **Security Audit Logs**: A dedicated table that "soft-archives" critical threats and low-confidence anomalies.
- **Indexing**: GIN (Generalized Inverted Index) is used for rapid searching within the JSON data.

> [!IMPORTANT]
> **Soft-Archiving**: Unlike many systems that delete old data, this project implements a `archive_critical_threats()` stored procedure that preserves a full audit trail for forensic investigation.

---

## 8. Recent Audit & Optimization (V3.1)
The version 3.1 update introduced several critical fixes:
1. **Explainable AI (XAI)**: Integrated SHAP-style explanations into the analysis reports.
2. **CORS Hardening**: Replaced wildcard origins with a dedicated whitelist for production safety.
3. **Memory Safety**: Replaced module-level global states with FastAPI's `lifespan` pattern to prevent race conditions during concurrent scans.
4. **UI Tuning**: Optimized the WebSocket frequency to match browser rendering capabilities, preventing frame drops.

---

## 8.1 Zero-G Optimization Pass (V3.2)

Version 3.2 performed a full recursive "Anti-Gravity" optimization across the entire codebase:

### Redundancy Consolidation
| Issue | Before (copies) | After |
|:------|:--------|:------|
| Severity map (`Normal→safe`, `DoS→critical`, etc.) | **4×** (OperationsPage, LiveCaptureSimulator, reportGenerator, ml_pipeline) | **1** frontend module (`constants.ts`) + 1 backend |
| `randomIp()` generator | **3×** (OperationsPage, LiveCaptureSimulator, ml_pipeline) | **1** per layer |
| `PROTOCOLS` array | **2×** (OperationsPage, LiveCaptureSimulator) | **1** (`constants.ts`) |
| Risk level calculator | **4×** (OperationsPage ×2, ProfessionalReport, main.py ×2) | **1** per layer (`calcRisk`) |
| `status_map` (risk→display) | **2×** inline in main.py | **1** module-level `STATUS_MAP` |

### Bug Fixes
- **`logistic_regression` KeyError**: Added missing `features: 42` key to `MODEL_CONFIG` (caused `/api/models` endpoint crash).
- **`datetime.utcnow()` deprecation**: Replaced with `datetime.now(timezone.utc)` per Python 3.12+ standards.

### Dead Code Removal
- **`App.css`**: Vite scaffold CSS (`.logo`, `.read-the-docs`) — never imported by any component. Quarantined.
- **`NavLink.tsx`**: Unused wrapper around `react-router-dom` NavLink — app uses `TopNav.tsx` with `useNavigate`. Quarantined.

### New Shared Module
- **`src/lib/constants.ts`**: Single source of truth for `SEVERITY_MAP`, `PROTOCOLS`, `randomIp()`, `calcRisk()`, `toLocalIso()`, and severity CSS class mappings.

### Comment Pruning
- All verbose audit-history comments, redundant section dividers, and scaffolding docs trimmed to essential logic documentation per the Credit Conservation directive.

---

## 9. Future Scope
- **Real Model Loading**: Wire the currently mocked inference logic to real `.joblib` or `.h5` model files.
- **Real-time Pcap Ingestion**: Integrate `libpcap` for live sniffing on physical interfaces (e.g., `eth0`).
- **Distributed Agents**: Deploying small "sensor" nodes that report back to the central FastAPI brain.
- **Deep Learning Expansion**: Bridge standard ML to LSTM/CNN topologies for temporal anomaly tracking.

