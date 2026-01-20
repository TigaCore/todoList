#!/bin/bash

# setup_prod.sh - 生产环境初始化脚本
# 用途：确保部署目录和依赖环境就绪

set -e

APP_ROOT=$(pwd)
APP_DIR="/var/www/todo-app"

echo "================================================"
echo "🛠️  Tiga Todo - 生产环境初始化"
echo "================================================"

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then
  echo "❌ 请使用 root 权限运行 (sudo ./setup_prod.sh)"
  exit 1
fi

# 1. 检查 Nginx
echo "🔍 检查 Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx 未安装，请先安装 Nginx"
    exit 1
fi
echo "✅ Nginx 已安装"

# 2. 创建 Web 根目录
echo "📂 创建 Web 根目录..."
mkdir -p "$APP_DIR"
chown -R www-data:www-data "$APP_DIR"
chmod 755 "$APP_DIR"
echo "✅ $APP_DIR 已就绪"

# 3. 创建日志目录
echo "📂 创建日志目录..."
mkdir -p "$APP_ROOT/logs/deploy"
echo "✅ 日志目录已就绪"

echo ""
echo "================================================"
echo "🎉 初始化完成！"
echo "   - Web 目录: $APP_DIR"
echo "   - 请确保 Nginx 配置已指向该目录"
echo "   - 运行 ./deploy_app.sh 部署应用"
echo "================================================"
