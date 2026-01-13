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
*   `logs/` - Logs for backend and deployment.
*   `scripts`
    *   `setup_dev.sh` - Development environment setup.
    *   `start_app.sh` - Start development servers.
    *   `setup_prod.sh` - Production environment setup.
    *   `deploy_app.sh` - One-click deployment script.

---

## 🛠️ Development Workflow

Run this locally on your machine for development.

### 1. Initial Setup
```bash
git clone <repository-url>
cd todoList

# Install dependencies for both backend (venv) and frontend (npm)
./setup_dev.sh
```

### 2. Run Application
Start both Backend (8000) and Frontend (5173) with hot-reload:
```bash
./start_app.sh
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000

---

## 🚀 Production Deployment Workflow

Run this on your Linux server (e.g., Ubuntu).

### 1. Initial Server Setup (One-time)
After cloning the repo, run these scripts to configure the environment:

```bash
# 1. Install dependencies
./setup_dev.sh

# 2. Configure System Services (Systemd, Logrotate, Log dirs)
# This creates /etc/systemd/system/todolist-backend.service
sudo ./setup_prod.sh
```

### 2. Configure Nginx
Create or update your Nginx config (e.g., `/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name _; 

    root /var/www/todo-app;
    index index.html;

    # Frontend Logs
    access_log /home/ubuntu/todoList/logs/nginx/access.log;
    error_log /home/ubuntu/todoList/logs/nginx/error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy (Forward /api to Backend)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
Then restart Nginx: `sudo systemctl restart nginx`

### 3. Deploy / Update
Whenever you pull new code or want to redeploy (Frontend build + Backend restart), runs:

```bash
./deploy_app.sh
```
This script acts as the single source of truth for deployment. It will:
1. Update backend dependencies.
2. Restart the Systemd backend service.
3. Build the frontend and copy files to `/var/www/todo-app`.
4. Log everything to `logs/deploy/`.

---

## 📱 Mobile App Build

```bash
cd frontend
npm run build
npx cap sync
npx cap open android  # or ios
```

## Logs Location
- **Backend**: `logs/backend/server.log` (Rotated daily)
- **Frontend**: `logs/nginx/access.log` (Rotated daily)
- **Deployment**: `logs/deploy/`

## License

[MIT](LICENSE)