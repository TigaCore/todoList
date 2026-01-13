#!/bin/bash

# setup_prod.sh - One-time setup for Systemd Service & Logrotate

set -e

# 1. Config & User Detection
APP_ROOT=$(pwd)
if [ -n "$SUDO_USER" ]; then
    SERVICE_USER=$SUDO_USER
else
    SERVICE_USER=$(whoami)
fi
LOG_DIR="$APP_ROOT/logs/backend"

echo "🛠️  Setting up Production Environment..."
echo "👤 Service will run as: $SERVICE_USER"

# 2. Check permissions
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

# 3. Create Log Directory
echo "📂 Creating log directory..."
mkdir -p $LOG_DIR
mkdir -p "$APP_ROOT/logs/nginx"

# Set permissions for backend logs
chown -R $SERVICE_USER:$SERVICE_USER $LOG_DIR
chmod 755 $LOG_DIR

# Set permissions for Nginx logs
chown -R www-data:www-data "$APP_ROOT/logs/nginx"
chmod 755 "$APP_ROOT/logs/nginx"

# 4. Create Systemd Service File
echo "⚙️  Creating Systemd Service..."
cat > /etc/systemd/system/todolist-backend.service <<EOF
[Unit]
Description=TodoList Backend API Service
After=network.target

[Service]
User=$SERVICE_USER
WorkingDirectory=$APP_ROOT/backend
# Dynamic uv detection
ExecStart=/bin/bash -c 'if [ -f "$APP_ROOT/backend/uv.lock" ]; then \\
    if [ -f "\$HOME/.cargo/bin/uv" ]; then UV_BIN="\$HOME/.cargo/bin/uv"; \\
    elif [ -f "\$HOME/.local/bin/uv" ]; then UV_BIN="\$HOME/.local/bin/uv"; \\
    else UV_BIN="uv"; fi; \\
    \$UV_BIN run python main.py; \\
else source venv/bin/activate && python main.py; fi'
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
