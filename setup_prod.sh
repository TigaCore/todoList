#!/bin/bash

# setup_prod.sh - One-time setup for Systemd Service & Logrotate

set -e

APP_ROOT=$(pwd)
USER=$(whoami)
LOG_DIR="$APP_ROOT/logs/backend"

echo "🛠️  Setting up Production Environment..."

# 1. Check permissions
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

# 2. Create Log Directory
echo "📂 Creating log directory..."
mkdir -p $LOG_DIR
chown -R $USER:$USER $LOG_DIR
chmod 755 $LOG_DIR

# 3. Create Systemd Service File
echo "⚙️  Creating Systemd Service..."
cat > /etc/systemd/system/todolist-backend.service <<EOF
[Unit]
Description=TodoList Backend API Service
After=network.target

[Service]
User=$USER
WorkingDirectory=$APP_ROOT/backend
# Use uv if available, otherwise assume virtualenv or system python
# Trying to detect correct python path
ExecStart=/bin/bash -c 'if [ -f "$APP_ROOT/backend/uv.lock" ]; then $HOME/.cargo/bin/uv run python main.py; else source venv/bin/activate && python main.py; fi'
Restart=always
RestartSec=5

# Logging: Redirect stdout/stderr to file
StandardOutput=append:$LOG_DIR/server.log
StandardError=append:$LOG_DIR/server.log

[Install]
WantedBy=multi-user.target
EOF

# Reload Daemon
systemctl daemon-reload
echo "✅ Service file created at /etc/systemd/system/todolist-backend.service"

# 4. Configure Logrotate
echo "📜 Configuring Logrotate..."
cat > /etc/logrotate.d/todolist-backend <<EOF
$LOG_DIR/server.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
    copytruncate
    dateext
}
EOF

echo "✅ Logrotate config created at /etc/logrotate.d/todolist-backend"

# 5. Enable and Start Service
echo "🚀 Starting Service..."
systemctl enable todolist-backend
systemctl restart todolist-backend

echo "------------------------------------------------"
echo "🎉 Setup Complete!"
echo "   - Service Status: systemctl status todolist-backend"
echo "   - View Logs: tail -f $LOG_DIR/server.log"
echo "------------------------------------------------"
