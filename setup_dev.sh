#!/bin/bash

# setup_dev.sh - 开发环境初始化脚本
# 用途：首次克隆项目或依赖更新后运行

set -e

echo "================================================"
echo "🛠️  Tiga Todo - 开发环境配置"
echo "================================================"

# 检查 Node.js
echo "🔍 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 未找到 npm，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js $(node -v) | npm $(npm -v)"

# 安装前端依赖
echo ""
echo "📦 安装前端依赖..."
cd frontend
npm install
cd ..

echo ""
echo "================================================"
echo "🎉 配置完成！"
echo ""
echo "启动开发服务器："
echo "  ./dev_app.sh"
echo ""
echo "或手动启动："
echo "  cd frontend && npm run dev"
echo "================================================"

# 确保启动脚本可执行
chmod +x dev_app.sh deploy_app.sh 2>/dev/null || true
