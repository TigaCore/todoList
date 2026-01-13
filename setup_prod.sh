#!/bin/bash

# setup_prod.sh - One-time setup for Systemd Service & Logrotate

set -e

# 1. Config & User Detection
APP_ROOT=$(pwd)
if [ -n "$SUDO_USER" ]; then
    SERVICE_USER=$SUDO_USER
    SERVICE_USER_HOME=$(getent passwd "$SUDO_USER" | cut -d: -f6)
else
    SERVICE_USER=$(whoami)
    SERVICE_USER_HOME=$HOME
fi
LOG_DIR="$APP_ROOT/logs/backend"

echo "🛠️  Setting up Production Environment..."
echo "👤 Service will run as: $SERVICE_USER (Home: $SERVICE_USER_HOME)"
echo "📁 App Root: $APP_ROOT"

# 2. Check permissions
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

# 3. Create Log Directories
echo "📂 Creating log directories..."
mkdir -p "$LOG_DIR"
mkdir -p "$APP_ROOT/logs/nginx"
mkdir -p "$APP_ROOT/logs/deploy"

# Set permissions for backend logs
chown -R $SERVICE_USER:$SERVICE_USER "$LOG_DIR"
chmod 755 "$LOG_DIR"

# Set permissions for Nginx logs
chown -R www-data:www-data "$APP_ROOT/logs/nginx"
chmod 755 "$APP_ROOT/logs/nginx"

# Set permissions for deploy logs
chown -R $SERVICE_USER:$SERVICE_USER "$APP_ROOT/logs/deploy"
chmod 755 "$APP_ROOT/logs/deploy"

# 4. Make start_backend.sh executable
chmod +x "$APP_ROOT/start_backend.sh"

# 5. Create Systemd Service File
echo "⚙️  Creating Systemd Service..."
cat > /etc/systemd/system/todolist-backend.service <<EOF
[Unit]
Description=TodoList Backend API Service
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$APP_ROOT
ExecStart=$APP_ROOT/start_backend.sh
Restart=always
RestartSec=5

# Logging
StandardOutput=append:$LOG_DIR/server.log
StandardError=append:$LOG_DIR/server.log

[Install]
WantedBy=multi-user.target
EOF

# Reload Daemon
systemctl daemon-reload
echo "✅ Service file created at /etc/systemd/system/todolist-backend.service"

# 6. Configure Logrotate
echo "📜 Configuring Logrotate..."
cat > /etc/logrotate.d/todolist-backend <<EOF
$LOG_DIR/server.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 $SERVICE_USER $SERVICE_USER
    copytruncate
    dateext
}
EOF

echo "✅ Logrotate config created at /etc/logrotate.d/todolist-backend"

# 7. Enable and Start Service
echo "🚀 Starting Service..."
systemctl enable todolist-backend
systemctl restart todolist-backend

# Brief wait then check status
sleep 2
if systemctl is-active --quiet todolist-backend; then
    echo "✅ Service is running!"
else
    echo "⚠️  Service may have failed to start. Check logs:"
    echo "   journalctl -u todolist-backend -n 20"
fi

echo "------------------------------------------------"
echo "🎉 Setup Complete!"
echo "   - Service Status: systemctl status todolist-backend"
echo "   - View Logs: tail -f $LOG_DIR/server.log"
echo "------------------------------------------------"
