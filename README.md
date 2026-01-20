# Tiga Todo

一个现代化的待办事项应用，支持 Markdown 文档、实时同步、多端适配。

## ✨ 特性

- **Supabase 后端** - 实时数据同步、用户认证、PostgreSQL 数据库
- **React + Vite 前端** - 快速构建、热更新、TypeScript 支持
- **Glassmorphism UI** - 现代玻璃态设计，支持深色模式
- **PWA 支持** - 可安装为桌面/移动应用
- **移动端原生** - 通过 Capacitor 构建 iOS/Android 应用
- **Markdown 文档** - 支持在文档中创建任务，自动同步到任务列表
- **本地通知** - 任务提醒功能

## 📁 项目结构

```
todoList/
├── frontend/          # React + Vite 前端应用
│   ├── src/
│   │   ├── api/       # Supabase 客户端配置
│   │   ├── components/# UI 组件
│   │   ├── pages/     # 页面组件
│   │   ├── contexts/  # React Context (主题、语言)
│   │   └── utils/     # 工具函数
├── docs/              # 开发日志和设计文档
├── logs/              # 部署和 Nginx 日志
└── deploy_app.sh      # 部署脚本
```

## 🛠️ 脚本与工作流

项目分为开发环境（Dev）和生产环境（Prod），请根据场景选择对应的脚本：

| 场景 | 初始化脚本 | 启动/部署脚本 | 用途 |
|------|------------|---------------|------|
| **开发环境** | `setup_dev.sh` | `dev_app.sh` | 本地开发，启动前端热更新服务器 |
| **生产环境** | `setup_prod.sh` | `deploy_app.sh` | 服务器部署，配置 Nginx 并发布代码 |

---

## 🚀 开发环境 (Development)

适用于本地开发调试。

### 1. 初始化依赖

首次克隆项目或依赖更新后运行：

```bash
./setup_dev.sh
```

### 2. 配置 Supabase

在 `frontend/` 目录下创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 启动开发服务器

```bash
./dev_app.sh
```

访问 http://localhost:5173

---

## ☁️ 生产环境 (Production)

适用于自有服务器部署 (Nginx)。

### 1. 服务器初始化

首次部署时，确保目录就绪：

```bash
sudo ./setup_prod.sh
```

这会创建 `/var/www/todo-app` 目录并设置权限。Nginx 配置需自行配置到 `/etc/nginx/conf.d/`。

### 2. 发布更新

每次发布新版本：

```bash
./deploy_app.sh
```

脚本会编译前端并将静态文件复制到 `/var/www/todo-app`。

---

## 📱 构建移动应用

```bash
cd frontend

# 构建 Web 资源
npm run build

# 同步到原生项目
npx cap sync

# 打开 IDE
npx cap open android  # Android Studio
npx cap open ios      # Xcode
```

---

## 📝 开发日志

查看 `docs/` 目录获取完整的开发历史记录。

## 📄 License

MIT
