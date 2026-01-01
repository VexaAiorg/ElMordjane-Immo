# 🔧 Fixing Port 80 Conflict

## The Problem

You got this error:
```
Error: Bind for 0.0.0.0:80 failed: port is already allocated
```

**Why?** Port 80 is already being used by the system Nginx (which you need for SSL).

## ✅ The Solution

I've updated `docker-compose.prod.yml` to:
1. ✅ Removed the `version` field (obsolete warning)
2. ✅ Removed the nginx container (to avoid port conflict)
3. ✅ Exposed frontend on port **8080**
4. ✅ Exposed backend on port **3000**

Now the **system Nginx** will proxy to these ports.

---

## 🚀 Steps to Fix (Run on VPS)

### 1. Stop Current Containers

```bash
cd ~/ElMordjane-Immo
docker-compose -f docker-compose.prod.yml down
```

### 2. Pull Latest Changes

```bash
git pull origin main
```

### 3. Check What's Using Port 80

```bash
sudo lsof -i :80
```

You should see system Nginx. If you see something else, we need to stop it.

### 4. Redeploy

```bash
./deploy.sh
```

### 5. Configure System Nginx

Create the Nginx configuration for your domain:

```bash
sudo nano /etc/nginx/sites-available/elmordjane-immo
```

**Paste this configuration** (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client body size limit (for file uploads)
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Frontend - React App
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for API
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files and uploads
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache uploaded images
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 6. Enable the Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/elmordjane-immo /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 7. Test the Application

```bash
# Check if containers are running
docker ps

# Test backend
curl http://localhost:3000/api/health

# Test frontend
curl http://localhost:8080

# Test through Nginx
curl http://yourdomain.com
```

### 8. Setup SSL (Optional but Recommended)

```bash
sudo ./setup-ssl.sh
```

Or manually with certbot:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🎯 Quick Commands

```bash
# On VPS - Complete fix
cd ~/ElMordjane-Immo
docker-compose -f docker-compose.prod.yml down
git pull origin main
./deploy.sh

# Then configure Nginx as shown above
```

---

## ✅ Verification

After setup, verify everything works:

```bash
# Check containers
docker ps

# Should see:
# - elmordjane_db
# - elmordjane_backend (port 3000)
# - elmordjane_frontend (port 8080)

# Check Nginx
sudo systemctl status nginx

# Test application
curl http://yourdomain.com
```

---

## 📊 Architecture Now

```
Internet (Port 80/443)
    ↓
System Nginx (Reverse Proxy)
    ↓
    ├─→ Frontend Container (Port 8080)
    └─→ Backend Container (Port 3000)
            ↓
        Database Container (Internal)
```

This is the **correct production setup**! 🎉
