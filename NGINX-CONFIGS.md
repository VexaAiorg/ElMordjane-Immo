# 📁 Nginx Configuration Files Explained

## Overview

There are **TWO** nginx configurations in this project, each serving a different purpose:

---

## 1️⃣ `frontend/nginx.conf` - Frontend Container Config

**Location:** `frontend/nginx.conf`  
**Purpose:** Used INSIDE the frontend Docker container  
**Runs on:** Port 80 (inside container, exposed as 8080 on host)

### What it does:
- Serves the React static files (HTML, CSS, JS)
- Handles client-side routing (SPA)
- Runs inside the frontend container

### Used by:
```dockerfile
# frontend/Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**✅ This file is REQUIRED - Do not delete!**

---

## 2️⃣ `nginx/nginx.conf` - System Nginx Config

**Location:** `nginx/nginx.conf`  
**Purpose:** System Nginx reverse proxy configuration  
**Runs on:** Port 80/443 (on the VPS host)

### What it does:
- Receives all external traffic
- Routes requests to frontend container (port 8080)
- Routes API requests to backend container (port 3000)
- Handles SSL/HTTPS (after certbot setup)

### How to use:
```bash
# On VPS
sudo cp nginx/nginx.conf /etc/nginx/sites-available/elmordjane-immo
# Edit and replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/elmordjane-immo
sudo ln -s /etc/nginx/sites-available/elmordjane-immo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**✅ This file is REQUIRED for production deployment**

---

## 🏗️ Architecture Flow

```
Internet (Port 80/443)
    ↓
System Nginx (/etc/nginx) ← Uses: nginx/nginx.conf
    ↓
    ├─→ Frontend Container (Port 8080)
    │       ↓
    │   Container Nginx ← Uses: frontend/nginx.conf
    │       ↓
    │   React Static Files
    │
    └─→ Backend Container (Port 3000)
            ↓
        Express API
            ↓
        PostgreSQL Database
```

---

## ❌ Deleted Files

- **`nginx/production.conf`** - Was for Docker nginx container (no longer needed)
- **`nginx/system-nginx.conf`** - Renamed to `nginx/nginx.conf`

---

## 📋 Summary

| File | Purpose | Used Where | Keep? |
|------|---------|------------|-------|
| `frontend/nginx.conf` | Serve React files | Inside frontend container | ✅ YES |
| `nginx/nginx.conf` | Reverse proxy | System Nginx on VPS | ✅ YES |

**Only 2 nginx configs needed!** Each serves a specific purpose and they work together.
