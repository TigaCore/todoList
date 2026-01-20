#!/bin/bash

# deploy_app.sh - 部署脚本
# 用途：编译前端并部署到 /var/www/todo-app

set -e

APP_DIR="/var/www/todo-app"
LOG_DIR="$(pwd)/logs/deploy"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/deploy_$DATE.log"

# 创建日志目录
mkdir -p "$LOG_DIR"

echo "================================================" | tee -a "$LOG_FILE"
echo "🚀 Tiga Todo - 部署 $(date)" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"

# 1. 编译前端
echo "" | tee -a "$LOG_FILE"
echo "🏗️  [1/2] 编译前端..." | tee -a "$LOG_FILE"
cd frontend

npm install >> "$LOG_FILE" 2>&1
if npm run build >> "$LOG_FILE" 2>&1; then
    echo "✅ 编译成功" | tee -a "$LOG_FILE"
else
    echo "❌ 编译失败，请检查日志: $LOG_FILE" | tee -a "$LOG_FILE"
    exit 1
fi

cd ..

# 2. 部署静态文件
echo "" | tee -a "$LOG_FILE"
echo "📂 [2/2] 部署到 $APP_DIR..." | tee -a "$LOG_FILE"

if sudo cp -r frontend/dist/* "$APP_DIR/"; then
    sudo chown -R www-data:www-data "$APP_DIR"
    echo "✅ 部署成功" | tee -a "$LOG_FILE"
else
    echo "❌ 部署失败 (权限不足？)" | tee -a "$LOG_FILE"
    exit 1
fi

echo "" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"
echo "🎉 完成！" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"
