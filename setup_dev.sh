#!/bin/bash

# setup_dev.sh - One-click development environment setup

set -e # Exit on error

echo "------------------------------------------------"
echo "🛠️  Setting up Tiga Todo List Development Environment"
echo "------------------------------------------------"

# 1. Check Pre-requisites
echo "🔍 Checking dependencies..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not found."
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not found."
    exit 1
fi
echo "✅ Dependencies found."

# 2. Setup Backend
echo "------------------------------------------------"
echo "📦 Setting up Backend..."
cd backend

# Check for uv
if ! command -v uv &> /dev/null; then
    echo "⚠️  uv is not installed. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.cargo/env 2>/dev/null || true
fi

# Create venv and install dependencies using uv
echo "   Syncing dependencies with uv..."
if [ -f "uv.lock" ]; then
    uv sync
elif [ -f "pyproject.toml" ]; then
    uv sync
elif [ -f "requirements.txt" ]; then
    uv venv
    source .venv/bin/activate 2>/dev/null || source venv/bin/activate
    uv pip install -r requirements.txt
else
    echo "⚠️  No dependency file found (pyproject.toml or requirements.txt)."
fi

cd ..
echo "✅ Backend setup complete."

# 3. Setup Frontend
echo "------------------------------------------------"
echo "🎨 Setting up Frontend..."
cd frontend

echo "   Installing npm packages..."
npm install

cd ..
echo "✅ Frontend setup complete."

echo "------------------------------------------------"
echo "🎉 Setup Finished!"
echo ""
echo "You can now run the app using:"
echo "./start_app.sh"
echo "------------------------------------------------"

# Make start script executable just in case
chmod +x start_app.sh
