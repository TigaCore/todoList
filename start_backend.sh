#!/bin/bash

# start_backend.sh - Wrapper script for starting backend service
# Used by Systemd to start the backend with proper uv/python detection

cd "$(dirname "$0")/backend"

# Detect uv binary location
if [ -f "$HOME/.cargo/bin/uv" ]; then
    UV_BIN="$HOME/.cargo/bin/uv"
elif [ -f "$HOME/.local/bin/uv" ]; then
    UV_BIN="$HOME/.local/bin/uv"
elif command -v uv &> /dev/null; then
    UV_BIN="uv"
else
    UV_BIN=""
fi

# Start backend
if [ -n "$UV_BIN" ] && [ -f "uv.lock" ]; then
    echo "Starting with uv: $UV_BIN"
    exec $UV_BIN run python main.py
elif [ -d "venv" ] || [ -d ".venv" ]; then
    echo "Starting with virtualenv"
    source venv/bin/activate 2>/dev/null || source .venv/bin/activate
    exec python main.py
else
    echo "Starting with system python"
    exec python3 main.py
fi
