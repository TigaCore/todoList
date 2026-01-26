# Tiga-Todo 项目介绍

> 一个现代化的待办事项应用，支持 Markdown 文档、实时同步、多端适配

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [功能特性](#功能特性)
4. [项目结构](#项目结构)
5. [开发日志摘要](#开发日志摘要)

---

## 项目概述

**Tiga-Todo** 是一款现代化的跨平台待办事项应用，采用"任务优先笔记"的设计理念。用户可以在富文本笔记中直接创建 Markdown 任务，系统会自动同步到任务列表。

### 核心特点

- ✨ **现代化 UI** - Glassmorphism 玻璃态设计，Spring 物理动画
- 📱 **移动优先** - PWA 支持，可通过 Capacitor 构建原生 App
- 🔄 **实时同步** - 基于 Supabase 的实时数据同步
- 📝 **Markdown 集成** - 文档内嵌任务，支持代码高亮和 Mermaid 图表
- 🔔 **本地通知** - 精确到分钟的提醒功能

---

## 技术栈

### 前端

| 技术 | 用途 |
|------|------|
| **React 18** | UI 框架 |
| **Vite** | 构建工具 |
| **TypeScript** | 类型安全 |
| **Framer Motion** | 动画引擎 |
| **Tiptap** | 富文本编辑器 |
| **Tailwind CSS** | 样式框架 |
| **Capacitor** | 跨平台原生支持 |

### 后端与服务

| 服务 | 用途 |
|------|------|
| **Supabase** | 数据库、认证、实时同步 |
| **Vercel** | 前端部署 |
| **PostgreSQL** | 数据存储 |

---

## 功能特性

### ✅ 已完成

#### 核心功能
- 用户注册/登录/登出
- 任务 CRUD（创建、读取、更新、删除）
- 任务完成状态切换
- 到期日期设置
- 本地通知提醒

#### UI/UX
- 响应式设计（Mobile First）
- Glassmorphism 视觉风格
- Spring 物理动画
- 侧边栏导航
- FAB 快速添加按钮
- 底部弹出式日期选择器
- 全屏编辑器（支持源代码/渲染/分屏模式）
- 快捷键提示功能

#### 编辑器
- Tiptap WYSIWYG 编辑器
- Markdown 实时渲染
- 代码语法高亮（20+ 语言）
- Mermaid 图表支持

### 🔨 待开发

#### P0 - 核心体验
- 任务拖拽排序
- 任务搜索功能
- 任务标签/分类
- 子任务支持
- 重复任务
- 图片上传/粘贴

#### P1 - 体验提升
- Dark Mode 深色模式
- 主题色自定义
- 下拉刷新
- 左滑删除/右滑完成
- Android 平台支持

#### P2 - 进阶功能
- 多设备实时同步
- 任务分享
- 生产力日历视图
- 数据导出（JSON/CSV）

---

## 项目结构

```
todoList/
├── frontend/                 # React + Vite 前端
│   ├── src/
│   │   ├── api/             # Supabase 客户端
│   │   ├── components/      # UI 组件
│   │   │   ├── Dashboard/   # 主仪表盘
│   │   │   ├── NoteEditor/  # 笔记编辑器
│   │   │   ├── TodoItem/    # 任务项
│   │   │   └── ...
│   │   ├── pages/           # 页面
│   │   ├── contexts/        # React Context
│   │   │   ├── ThemeContext # 主题管理
│   │   │   └── ...
│   │   └── utils/           # 工具函数
│   │       └── markdownTasks.ts
│   └── capacitor.config.ts  # Capacitor 配置
│
├── docs/                    # 文档
│   ├── 2026-01-07_dev_log.md
│   ├── 2026-01-08_dev_log.md
│   ├── 2026-01-09_dev_log.md
│   ├── 2026-01-10_dev_log.md
│   ├── 2026-01-12_dev_log.md
│   ├── 2026-01-20_dev_log.md
│   ├── ROADMAP.md           # 路线图
│   └── git_workflow.md
│
├── logs/                    # 日志
│
├── deploy_app.sh           # Vercel 部署脚本
├── dev_app.sh              # 开发启动脚本
└── setup_dev.sh            # 开发环境初始化
```

---

## 开发日志摘要

### 2026-01-20
**核心更新**: 修复文档任务实时同步问题，重构项目脚本适配 Supabase + Vercel 架构，升级 Logo 和 UI 细节。

### 2026-01-12
**UI 优化**: Tab 切换动画修复，全屏编辑器优化（居中显示、快捷键提示），Settings 功能实现（密码修改、数据导出）。

### 2026-01-10
**编辑器增强**: 代码块多语言支持，Mermaid 图表支持，全屏编辑器（Editor/Preview/Split 三种模式）。

### 2026-01-09
**基础设施**: 本地网络访问支持，移动端 Reminder 系统重构。

### 2026-01-08
**后端迁移**: Vercel 部署修复，Supabase 迁移（解决 IPv6 问题），移除 passlib 依赖。

### 2026-01-07
**产品转型**: 从 Todo 应用转型为"任务优先笔记"应用，集成 Tiptap 编辑器，Masonry 笔记布局，底部导航重构。

---

## 部署信息

- **Demo**: https://todo-list-git-dev-badgergys-projects.vercel.app/
- **GitHub**: https://github.com/TigaCore/todoList
- **仓库分支**: dev（当前工作分支）

---

*文档生成时间: 2026-01-26*