# Tiga Todo App - 功能需求清单

> 🎯 目标：打造一款简洁、高效、体验一流的跨平台 Todo 应用

---

## ✅ 已完成功能

### 核心功能
- [x] 用户注册/登录/登出
- [x] 任务 CRUD（创建、读取、更新、删除）
- [x] 任务完成状态切换
- [x] 到期日期设置
- [x] 本地通知提醒

### UI/UX
- [x] 响应式设计（Mobile First）
- [x] Glassmorphism 视觉风格
- [x] Spring 物理动画
- [x] 侧边栏导航
- [x] FAB 快速添加按钮
- [x] 底部弹出式日期选择器

### 技术
- [x] React + Vite + TypeScript
- [x] FastAPI 后端
- [x] Capacitor iOS 集成
- [x] Framer Motion 动画

---

## 🔨 待开发功能

### P0 - 核心体验（优先级最高）

#### 任务管理增强
- [ ] 任务拖拽排序
- [ ] 任务搜索功能
- [ ] 任务标签/分类
- [ ] 子任务支持
- [ ] 重复任务（每日/每周/自定义）

#### 编辑器优化
- [ ] 图片上传/粘贴
- [ ] 更丰富的 Markdown 工具栏
- [ ] 自动保存草稿

### P1 - 体验提升

#### UI/动画
- [ ] Dark Mode 深色模式
- [ ] 主题色自定义
- [ ] iOS Dynamic Island 适配
- [ ] 骨架屏加载状态
- [ ] 空状态插画

#### 移动端
- [ ] 下拉刷新
- [ ] 左滑删除 / 右滑完成
- [ ] Haptic 触觉反馈
- [ ] Android 平台支持

### P2 - 进阶功能

#### 协作 & 同步
- [ ] 多设备实时同步
- [ ] 任务分享
- [ ] 团队协作（共享列表）

#### 数据 & 统计
- [ ] 任务完成统计
- [ ] 生产力日历视图
- [ ] 数据导出（JSON/CSV）

#### 集成
- [ ] 日历集成（Google/Apple）
- [ ] Webhook / API 开放
- [ ] Widget 小组件

### P3 - 平台 & 发布

- [ ] PWA 配置（manifest + Service Worker）
- [ ] App Store 发布准备
- [ ] Google Play 发布准备
- [ ] Web 域名 & 部署

---

## 🐛 已知问题

- [ ] iOS Dynamic Island 区域显示优化
- [ ] NoteEditor 外部点击关闭确认
- [ ] 长列表性能优化（虚拟滚动）

---

## 📝 技术债务

- [ ] 代码分割（Code Splitting）减小包体积
- [ ] 单元测试覆盖
- [ ] E2E 测试（Playwright）
- [ ] API 文档（OpenAPI/Swagger）
- [ ] 错误边界（Error Boundary）

---

*最后更新：2026-01-07*
