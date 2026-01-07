# Full-Stack ToDo List App

A modern, cross-platform ToDo list application built with a Python backend and a React frontend. Designed to run on Web, Mobile (via Capacitor), and Desktop.

## 🏗 Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (Dev) / PostgreSQL (Prod)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (OAuth2)

### Frontend (Cross-Platform)
- **Core**: React + TypeScript + Vite
- **UI Architecture**: Tailwind CSS
- **Mobile Runtime**: Capacitor (iOS & Android)
- **State Management**: React Hooks (Local State)

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+

### Quick Start (One-Click)
Run the startup script to launch both services:
```bash
./start_app.sh
```

### Manual Startup

**1. Backend**
```bash
cd backend
pip install -r pyproject.toml
python main.py
```
*Server: http://localhost:8000 | Docs: http://localhost:8000/docs*

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```
*App: http://localhost:5173*

## 📱 Mobile Development (Capacitor)
To build for mobile devices:

1. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Sync with Capacitor**:
   ```bash
   npx cap sync
   ```
3. **Open Native IDE**:
   ```bash
   npx cap open android  # Requires Android Studio
   # or
   npx cap open ios      # Requires Xcode (Mac only)
   ```

## 📂 Project Structure
```
.
├── backend/            # FastAPI Server
│   ├── app/            # App Logic (Models, API, etc.)
│   └── main.py         # Entry Point
├── frontend/           # React Web App
│   ├── src/            # Components & Pages
│   └── capacitor.config.ts # Mobile Config
└── start_app.sh        # Startup Script
```