#!/bin/bash
echo "Starting ML-Based IDS Platform..."

# Start FastAPI Backend in background
echo "Starting FastAPI Backend..."
(cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload) &
BACKEND_PID=$!

# Start React Frontend in background
echo "Starting React Frontend..."
(npm install && npm run dev) &
FRONTEND_PID=$!

echo "Both servers are booting up."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"

# Wait for process to exit
trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT
wait
