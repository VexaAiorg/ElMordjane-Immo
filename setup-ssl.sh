#!/bin/bash

# SSL Certificate Setup Script for ElMordjane-Immo
# This script helps set up SSL certificates using Certbot

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔒 SSL Certificate Setup for ElMordjane-Immo${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Certbot not found. Installing...${NC}"
    apt update
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot installed${NC}"
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Nginx not found. Installing...${NC}"
    apt update
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx installed${NC}"
fi

# Get domain name
echo ""
read -p "Enter your domain name (e.g., elmordjane-immo.com): " DOMAIN
read -p "Include www subdomain? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    DOMAINS="-d $DOMAIN -d www.$DOMAIN"
else
    DOMAINS="-d $DOMAIN"
fi

# Get email
read -p "Enter your email address for SSL notifications: " EMAIL

# Create Nginx configuration
echo ""
echo -e "${BLUE}📝 Creating Nginx configuration...${NC}"

NGINX_CONF="/etc/nginx/sites-available/elmordjane-immo"
cat > $NGINX_CONF << EOF
# HTTP server - redirects to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Allow Certbot to verify domain ownership
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration (will be added by Certbot)
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client body size limit
    client_max_body_size 50M;

    # Proxy to Docker containers
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/elmordjane-immo
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo ""
echo -e "${BLUE}🧪 Testing Nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    systemctl reload nginx
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

# Create certbot directory
mkdir -p /var/www/certbot

# Obtain SSL certificate
echo ""
echo -e "${BLUE}🔐 Obtaining SSL certificate...${NC}"
echo -e "${YELLOW}This may take a few moments...${NC}"
echo ""

certbot --nginx $DOMAINS --email $EMAIL --agree-tos --no-eff-email --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ SSL certificate obtained successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Certificate Information:${NC}"
    certbot certificates
    echo ""
    echo -e "${GREEN}🎉 Your site is now secured with HTTPS!${NC}"
    echo -e "${GREEN}   Access your site at: https://$DOMAIN${NC}"
    echo ""
    echo -e "${BLUE}📅 Auto-renewal is configured. Test it with:${NC}"
    echo -e "   sudo certbot renew --dry-run"
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "  1. DNS not pointing to this server"
    echo "  2. Firewall blocking port 80/443"
    echo "  3. Domain not yet propagated"
    echo ""
    echo "Please check and try again."
    exit 1
fi

# Set up auto-renewal
echo ""
echo -e "${BLUE}⏰ Setting up automatic renewal...${NC}"
systemctl status certbot.timer || systemctl enable certbot.timer
echo -e "${GREEN}✅ Auto-renewal configured${NC}"

echo ""
echo -e "${GREEN}✅ SSL setup completed successfully!${NC}"
