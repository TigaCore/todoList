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
- **iOS Build**: Capacitor iOS integration complete, buildable via Xcode.

## 4. Session 2 Updates (2026-01-07 PM)

### 📱 Mobile Date Picker
- Replaced native `datetime-local` input with custom **Bottom Sheet** date picker
- Uses `react-mobile-picker` for iOS-style wheel selection
- Quick preset buttons: Today, Tomorrow, Next Week
- Spring animation for sheet entrance/exit

### 🎯 TodoItem UX Simplification
- **Removed** inline expand/collapse functionality
- **New behavior**: Click card → Opens NoteEditor directly
- Cleaner card design without ChevronDown button

### 🎨 Login & Register Redesign
- Minimal, unified design language across both pages
- **Gradient backgrounds** with animated floating orbs (breathing effect)
- **Icon-prefixed inputs** with 2xl rounded corners
- **Spring entrance animations** with staggered delays
- **Loading spinner** on submit button
- Consistent `indigo-500` color palette

### 📱 iOS / Capacitor Integration
- Fixed touch targets for iOS (44x44px minimum)
- Added `pt-safe` iOS safe area padding to Sidebar header
- Build pipeline: `npm run build && npx cap sync ios && npx cap open ios`
- Tailwind Typography plugin added for Markdown rendering

### 🔧 Technical Fixes
- Fixed TypeScript lint errors (unused imports)
- Removed dead code (e.g., `filter === 'active'` check)
- Unified FAB to circular design (`rounded-full`, 56x56)

## 5. Next Steps
- **iOS Safe Area Polish**: Fine-tune for Dynamic Island / notch devices
- **PWA Configuration**: Finalize `manifest.json` and service workers
- **Dark Mode**: Consider adding theme toggle

