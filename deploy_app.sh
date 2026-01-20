#!/bin/bash

# deploy_app.sh - 自有服务器部署脚本
# 用途：构建前端并部署到 Nginx 目录

set -e

# 配置
APP_DIR="/var/www/todo-app"
LOG_DIR="$(pwd)/logs/deploy"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/deploy_$DATE.log"

# 创建日志目录
mkdir -p "$LOG_DIR"

echo "================================================" | tee -a "$LOG_FILE"
echo "🚀 Tiga Todo - 服务器部署 $(date)" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"

# 1. 构建前端
echo "" | tee -a "$LOG_FILE"
echo "🏗️  [1/2] 构建前端..." | tee -a "$LOG_FILE"
cd frontend

# 安装依赖并构建
if npm install && npm run build >> "$LOG_FILE" 2>&1; then
    echo "✅ 构建成功" | tee -a "$LOG_FILE"
else
    echo "❌ 构建失败，请检查日志" | tee -a "$LOG_FILE"
    exit 1
fi

cd ..

# 2. 部署到 Nginx
echo "" | tee -a "$LOG_FILE"
echo "📂 [2/2] 部署到 Nginx ($APP_DIR)..." | tee -a "$LOG_FILE"

# 确保目标目录存在
if [ ! -d "$APP_DIR" ]; then
    echo "⚠️  目标目录不存在，正在创建..." | tee -a "$LOG_FILE"
    sudo mkdir -p "$APP_DIR"
fi

# 备份旧版本 (可选)
# sudo mv $APP_DIR $APP_DIR.bak

# 复制文件
if sudo cp -r frontend/dist/* "$APP_DIR/"; then
    echo "✅ 文件部署成功" | tee -a "$LOG_FILE"
else
    echo "❌ 文件部署失败 (权限不足？)" | tee -a "$LOG_FILE"
    exit 1
fi

# 修复权限
sudo chown -R www-data:www-data "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"

echo "" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"
echo "🎉 部署完成！" | tee -a "$LOG_FILE"
echo "   日志: $LOG_FILE" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"
