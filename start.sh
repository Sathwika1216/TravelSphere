#!/bin/bash
# TravelSphere Startup Script
# Usage: ./start.sh

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "🌍 Starting TravelSphere..."
echo "   Root: $ROOT"

# ── Backend ──────────────────────────────────────────────────────────────────
echo ""
echo "▶ Starting Flask backend on port 5000..."
cd "$ROOT"
if [ -f ".env" ]; then
  echo "  [.env found — loading environment variables]"
fi

python3 app.py &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

sleep 2

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ""
echo "▶ Starting React frontend on port 5173..."
cd "$ROOT/frontend"
npm install --silent
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ TravelSphere is starting!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
