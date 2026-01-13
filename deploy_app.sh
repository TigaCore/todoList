#!/bin/bash

# deploy_app.sh - Consolidated Production Deployment Script
# Usage: ./deploy_app.sh

set -e

# Config
APP_ROOT=$(pwd)
APP_DIR="/var/www/todo-app"
LOG_DIR="$APP_ROOT/logs/deploy"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/deploy_$DATE.log"

# Create logs directory
mkdir -p $LOG_DIR

echo "------------------------------------------------" | tee -a $LOG_FILE
echo "🚀 Starting Full Application Deployment at $(date)" | tee -a $LOG_FILE
echo "------------------------------------------------" | tee -a $LOG_FILE

# ------------------------------------------------------------------
# 1. Backend Update
# ------------------------------------------------------------------
echo "🔄 [1/3] Updating Backend..." | tee -a $LOG_FILE

echo "   Checking backend dependencies..." | tee -a $LOG_FILE
cd backend
if command -v uv &> /dev/null; then
    uv sync >> $LOG_FILE 2>&1
elif [ -f "requirements.txt" ]; then
    # Assume venv exists if not using uv
    source venv/bin/activate 2>/dev/null || true
    pip install -r requirements.txt >> $LOG_FILE 2>&1
fi
cd ..

echo "   Restarting Backend Service..." | tee -a $LOG_FILE
if sudo systemctl restart todolist-backend; then
    echo "✅ Backend Service Restarted" | tee -a $LOG_FILE
else
    echo "❌ Failed to restart backend service" | tee -a $LOG_FILE
    exit 1
fi

# ------------------------------------------------------------------
# 2. Frontend Build & Deploy
# ------------------------------------------------------------------
echo "🏗️  [2/3] Building Frontend..." | tee -a $LOG_FILE
cd frontend
if npm install && npm run build >> $LOG_FILE 2>&1; then
    echo "✅ Frontend Build Successful" | tee -a $LOG_FILE
else
    echo "❌ Frontend Build Failed" | tee -a $LOG_FILE
    exit 1
fi
cd ..

echo "📂 [3/3] Deploying to Nginx ($APP_DIR)..." | tee -a $LOG_FILE
# Create target directory if needed
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
fi

# Copy files
if sudo cp -r frontend/dist/* $APP_DIR/; then
    echo "✅ Files deployed successfully" | tee -a $LOG_FILE
else
    echo "❌ Failed to deploy files" | tee -a $LOG_FILE
    exit 1
fi

# Fix permissions
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

echo "------------------------------------------------" | tee -a $LOG_FILE
echo "🎉 Deployment Complete!" | tee -a $LOG_FILE
echo "   - Backend Logs: tail -f logs/backend/server.log"
echo "   - Frontend: http://$(curl -s ifconfig.me) or your domain"
echo "------------------------------------------------" | tee -a $LOG_FILE
