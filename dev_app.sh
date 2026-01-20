#!/bin/bash

# dev_app.sh - 启动开发服务器
# 用途：本地开发时运行

echo "================================================"
echo "🚀 启动 Tiga Todo 开发服务器"
echo "================================================"

cd frontend

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    npm install
fi

echo ""
echo "🌐 启动地址: http://localhost:5173"
echo "📱 局域网访问: http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}'):5173"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "================================================"

npm run dev
