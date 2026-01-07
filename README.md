# Tiga Todo List App

A modern, responsive Todo List application with a Python FastAPI backend and a React (Vite) frontend.

![App Screenshot](frontend/public/icon-512.png) 
*(Note: Replace with actual screenshot path if available)*

## Features

*   **FastAPI Backend**: Robust and fast API handling.
*   **React Frontend**: interactive UI with smooth animations (Framer Motion).
*   **Mobile-First Design**: Optimized for mobile experience with touch-friendly interactions.
*   **PWA Support**: Installable on mobile devices.
*   **Local Notifications**: Task reminders using Capacitor.

## Project Structure

*   `backend/` - Python FastAPI application.
*   `frontend/` - React Vite application.
*   `start_app.sh` - Script to launch both backend and frontend.
*   `setup_dev.sh` - Script to configure the development environment.

## 🚀 Getting Started

### Prerequisites

*   Python 3.12+
*   Node.js & npm

### One-Click Setup

For new developers, we provide a setup script to configure everything automatically:

```bash
# 1. Clone the repository
git clone <repository-url>
cd todoList

# 2. Run the setup script
./setup_dev.sh
```

This script will:
*   Create a Python virtual environment (`backend/venv`).
*   Install backend dependencies.
*   Install frontend node modules.

### Running the App

To start both the backend and frontend servers:

```bash
./start_app.sh
```

*   **Frontend**: http://localhost:5173
*   **Backend**: http://localhost:8000

## Development

*   **Backend**: 
    *   Navigate to `backend/`.
    *   Activate venv: `source venv/bin/activate`.
    *   Run individually: `uvicorn main:app --reload`.
*   **Frontend**:
    *   Navigate to `frontend/`.
    *   Run individually: `npm run dev`.

## License

[MIT](LICENSE)