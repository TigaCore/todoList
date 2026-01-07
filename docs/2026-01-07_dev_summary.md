# Tiga Project Development Log
Date: 2026-01-07
Author: Antigravity Agent & User

## 1. Project Overview
**Tiga** is a modern, lightweight, and cross-platform ToDo list application designed with a "Mobile First" philosophy. It aims to provide a premium user experience comparable to top-tier apps like TickTick or Notion, but with a cleaner, focused interface.

### Tech Stack
- **Frontend**: React, Vite, TypeScript, TailwindCSS
- **Animation**: Framer Motion (for spring physics and micro-interactions)
- **Mobile/PWA**: Capacitor (planned), Responsive Web Design
- **Backend**: FastAPI (Python), SQLite, SQLAlchemy

## 2. Recent Development Highlights (Phase 3: Mobile UX Refactor)

Today's session focused heavily on interacting refining the mobile experience and establishing a unique brand identity.

### 🎨 Branding & UI Overhaul
- **New Logo**: Designed and integrated the "Tiga" logo (Feather/Checkmark motif).
- **Glassmorphism Theme**: Applied a premium "Glass" aesthetic to the Login and Registration pages, featuring soft gradients, blur effects, and modern typography.
- **Sidebar Navigation**: Implemented a slide-in drawer for mobile navigation, cleaning up the main dashboard view.

### 📱 Mobile Experience Optimization
- **Floating Action Button (FAB)**: Added a sticky "Quick Add" button with a rubber-band spring animation.
- **Lightweight Note Editor**: Replaced the heavy `uiw/react-md-editor` with a custom, lightweight solution using `react-textarea-autosize` and `react-markdown`.
    - **Why?** The previous editor was too heavy for mobile control.
    - **Result**: A "Notion-like" clean writing interface with a minimal toolbar (Bold, List, Checkbox, Image) and instant Edit/Preview toggling.

### ✨ Non-Linear Animations (Juicy Feel)
Implemented "Spring Physics" animations to make the app feel alive:
- **Bouncy Checkbox**: Completing a task triggers a satisfying pop/spring animation on the checkmark.
- **Staggered List**: Task items slide in with a natural delay.
- **Elastic Sidebar**: The navigation drawer opens with a high-stiffness spring transition.
- **FAB Micro-interactions**: The add button rotates on entry and scales elastically when pressed.

## 3. Current System Status
- **Services**: Both Frontend (`:5173`) and Backend (`:8000`) are fully functional and integrated.
- **Deployment**: The app is runnable locally via `./start_app.sh`.

## 4. Next Steps
- **Mobile Date Picker**: Implement a custom "Bottom Sheet" date picker to replace the native browser input, offering quick presets (Today, Tomorrow).
- **PWA Configuration**: Finalize `manifest.json` and service workers for installability.
