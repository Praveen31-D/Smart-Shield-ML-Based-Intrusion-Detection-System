# Advanced ML-Based Intrusion Detection System (IDS-ML) — v3.2

Welcome to the Advanced ML-Based Intrusion Detection System project. This system is a dynamic, high-performance web application designed to demonstrate and operationalize modern machine learning models for detecting malicious network traffic.

## Project Structure & Architecture

The codebase strictly adheres to a modular, separated-concerns architecture to cleanly delineate the user interface, routing logic, and core analytical engines.

```text
/
├── backend/
│   ├── api/
│   │   └── main.py          # FastAPI application, REST endpoints, and WebSocket server
│   ├── core/
│   │   ├── ml_pipeline.py   # Machine learning inference engine (Random Forest, XGBoost, SVM, KNN)
│   │   └── scanner.py       # Active network discovery and TCP SYN/ACK scanner using Scapy
│   └── requirements.txt
├── src/
│   ├── components/          # Reusable React UI elements (Engine Configurator, Network Monitor)
│   ├── pages/               # Main application views (Operations Dashboard)
│   ├── data/                # Static attack definitions and mock datasets
│   └── lib/
│       ├── constants.ts     # Shared constants: SEVERITY_MAP, PROTOCOLS, randomIp, calcRisk
│       ├── reportGenerator.ts
│       └── utils.ts
└── ...
```

## Workflow of Files

The following sections define the exact data flow execution path, detailing how every component interacts from user input down to the system components.

1. **Frontend Interaction (`src/pages/OperationsPage.tsx`)**
   - The user selects a Machine Learning algorithm (e.g., XGBoost) and a Dataset (e.g., UNSW-NB15) via the **Engine Configurator**. The UI dynamically updates the contextual panel explaining the detection logic.
   - The user triggers an action: a file upload via `PacketAnalyzer` or opening the real-time `LiveCaptureSimulator`.

2. **API Routing (`backend/api/main.py`)**
   - The React frontend fires an asynchronous HTTP request (e.g., `POST /api/upload`) or establishes a highly responsive WebSocket connection (`WS /ws/live-capture`) pointing to the FastAPI backend.
   - `main.py` functions purely as the routing layer, parsing the requests, resolving the requested ML model ID, and delegating the heavy computation to the `/core/` modules to avoid blocking the API's event loop.

3. **Core ML Processing (`backend/core/ml_pipeline.py`)**
   - Given the user's selected model and target dataset, the `MultiModelIDS` engine simulates extraction of numeric features (e.g., 42 features for UNSW-NB15).
   - The prediction logic runs inferences scaling distinctly based on structural traits: XGBoost pushing `~99.9%` peak accuracy, Random Forest stabilizing at `98.63%`, SVM at `94%`, and KNN around `~85-93%`.
   - Threat severities and confidence scores are calculated and returned to `main.py` as a dictionary.

4. **Active Network Mapping (`backend/core/scanner.py`)**
   - When active network topology mapping is requested, `/api/scan` triggers the `scanner.py` module.
   - Using Python's `scapy`, the engine dispatches precise ARP requests across the local subnet to identify live devices. 
   - Transport layer states are audited by sending stateless TCP SYN queries against identified IPs. The application interprets the TCP flags in the target's replies (e.g., `SYN-ACK` = Open, `RST-ACK` = Closed) and generates a structured network manifest.

5. **Data Return & Dashboard Rendering (`src/components/`)**
   - The generated analytical dictionaries or active network maps are streamed back to the frontend.
   - The React application parses the payload, triggering state re-renders across the dashboard charts, live tables, and modal reports (like `ProfessionalReport.tsx`).

## Database Architecture & pgAdmin Integration

This platform natively integrates with PostgreSQL using the JSONB data type for robust, un-schematized tracking of evaluation metrics, tensors, and network parameters.

### Why PostgreSQL for this Project?
* **JSONB Support**: Crucial for storing unpredictable ML feature sets, varied algorithmic parameters (RF vs XGBoost), and complex evaluation metrics (arrays for ROC and Confusion Matrices) without forcing a rigid table schema.
* **ACID Compliance**: Gravity-level traffic surges are simulated; transaction compliance ensures scan history and reporting remain uncorrupted during a high-speed load.
* **Scalability**: Capable of efficiently handling millions of rows resulting from millisecond packet captures, heavily optimized by native GIN (Generalized Inverted Index) indexing.

### Setting up Live Security Real-Time Dashboard Widget in pgAdmin 4
1. Connect your instance in pgAdmin 4. Open your specific database dashboard tab.
2. Click **Add/Edit Custom Dashboard** (Gear icon in top navigation).
3. Add a new **Chart Widget** (Type: Line/Bar).
4. **SQL Query**:
   ```sql
   SELECT date_trunc('hour', timestamp) AS hour_block, COUNT(*) AS critical_events, pg_size_pretty(pg_database_size(current_database())) as db_size
   FROM network_analysis_reports
   WHERE network_security_status = 'Critical' AND timestamp >= NOW() - INTERVAL '24 HOURS'
   GROUP BY hour_block
   ORDER BY hour_block ASC;
   ```
5. Map Y-axis to `critical_events` and X-axis to time to watch for live surges indicating a simulated cyber attack breach.

## Changelog — v3.2 (Zero-G Optimization)

- **Redundancy Consolidation**: Severity map, randomIp, PROTOCOLS, and risk calculator deduplicated into `constants.ts` and backend utilities.
- **Bug Fix**: `logistic_regression` model missing `features` key → `KeyError` on `/api/models` endpoint.
- **Deprecation Fix**: `datetime.utcnow()` → `datetime.now(timezone.utc)` (Python 3.12+).
- **Dead Code Removal**: `App.css` (unused Vite scaffold), `NavLink.tsx` (unused component wrapper).
- **Comment Pruning**: Verbose audit-history comments trimmed to essential logic documentation.

## Setup Instructions

1. **Backend**:
   - `cd backend`
   - `pip install -r requirements.txt`
   - `uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload`

2. **Frontend**:
   - `npm install`
   - `npm run dev`

Navigate to `http://localhost:5173` to access the main operations dashboard.
