#!/usr/bin/env bash
# ClinicFlow AI Launcher for macOS & Linux

echo "========================================================"
echo "       ClinicFlow AI - Fullstack Healthcare Platform"
echo "========================================================"
echo ""

echo "[1/2] Starting Spring Boot Backend on http://localhost:8080 ..."
(cd backend && mvn spring-boot:run) &
BACKEND_PID=$!

echo "[2/2] Starting Vite React Frontend on http://localhost:3000 ..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

sleep 4
echo "Opening browser at http://localhost:3000 ..."
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:3000
elif command -v open > /dev/null; then
  open http://localhost:3000
fi

echo ""
echo "ClinicFlow AI is running!"
echo "- Web App:     http://localhost:3000"
echo "- Backend API: http://localhost:8080/api"
echo ""
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
