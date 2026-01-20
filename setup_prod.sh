#!/bin/bash

# setup_prod.sh - 生产环境初始化脚本
# 用途：配置 Nginx 和日志目录

set -e

APP_ROOT=$(pwd)
NGINX_CONF="/etc/nginx/sites-available/todo-app"
APP_DIR="/var/www/todo-app"

echo "================================================"
echo "🛠️  Tiga Todo - 生产环境配置"
echo "================================================"

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then
  echo "❌ 请使用 root 权限运行 (sudo ./setup_prod.sh)"
  exit 1
fi

# 1. 创建日志目录
echo "📂 [1/3] 创建日志目录..."
mkdir -p "$APP_ROOT/logs/nginx"
mkdir -p "$APP_ROOT/logs/deploy"

# 设置权限
chown -R www-data:www-data "$APP_ROOT/logs/nginx"
chmod 755 "$APP_ROOT/logs/nginx"

# 2. 创建 Web 根目录
echo "📂 [2/3] 创建 Web 根目录..."
mkdir -p "$APP_DIR"
chown -R www-data:www-data "$APP_DIR"
chmod 755 "$APP_DIR"

# 3. 配置 Nginx
echo "⚙️  [3/3] 配置 Nginx..."

# 检查 Nginx 是否安装
if ! command -v nginx &> /dev/null; then
    echo "⚠️  Nginx 未安装，正在安装..."
    apt-get update && apt-get install -y nginx
fi

# 写入 Nginx 配置
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;  # 替换为你的域名

    root $APP_DIR;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 前端路由支持 (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }

    # 日志
    access_log $APP_ROOT/logs/nginx/access.log;
    error_log $APP_ROOT/logs/nginx/error.log;
}
EOF

# 启用站点
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

# 测试并重载 Nginx
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx 配置已更新并重载"
else
    echo "❌ Nginx 配置测试失败，请手动检查"
fi

echo ""
echo "================================================"
echo "🎉 配置完成！"
echo "   - Web 目录: $APP_DIR"
echo "   - Nginx 配置: $NGINX_CONF"
echo "   - 访问日志: logs/nginx/access.log"
echo "================================================"
