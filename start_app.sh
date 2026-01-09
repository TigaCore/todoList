#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "Backend stopped."
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "Frontend stopped."
    fi
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

echo "------------------------------------------------"
echo "Starting Todo List App..."
echo "------------------------------------------------"

# Start Backend
echo "Starting Backend..."
cd backend
if command -v uv &> /dev/null; then
    uv run python main.py > ../logs/backend.log 2>&1 &
else
    # Fallback for systems without uv in path but with venv
    source venv/bin/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null
    python3 main.py > ../logs/backend.log 2>&1 &
fi
BACKEND_PID=$!
cd ..
echo "✅ Backend running (PID: $BACKEND_PID)"
echo "   Logs: logs/backend.log"

# Start Frontend
echo "Starting Frontend..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend running (PID: $FRONTEND_PID)"
echo "   Logs: logs/frontend.log"

echo "------------------------------------------------"
echo "App is running! Access it at:"
echo "   Frontend: http://localhost:5173 & http://<ip>:5173"
echo "   Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services."
echo "------------------------------------------------"

# Wait for processes
wait
