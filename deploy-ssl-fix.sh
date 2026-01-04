#!/bin/bash
# Quick Deployment Script with SSL Fixes
# Run this after pulling the SSL fixes

set -e

echo "🚀 ElMordjane-Immo - SSL Fix Deployment"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print messages
print_step() {
    echo -e "${BLUE}➜ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running from project root
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "Must run from project root directory"
    exit 1
fi

print_step "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_success "Docker Compose found"

# Check .env.production
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found"
    read -p "Create from template? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.production.example .env.production
        print_warning "Please edit .env.production with your actual values"
        read -p "Press Enter when done..."
    else
        print_error "Cannot proceed without .env.production"
        exit 1
    fi
fi
print_success ".env.production found"

echo ""
print_step "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down
print_success "Containers stopped"

echo ""
print_step "Building images (this may take a few minutes)..."
docker-compose -f docker-compose.prod.yml build --no-cache
print_success "Images built successfully"

echo ""
print_step "Starting containers..."
docker-compose -f docker-compose.prod.yml up -d
print_success "Containers started"

echo ""
print_step "Waiting for services to be healthy..."
sleep 15

# Check container status
echo ""
print_step "Checking container status..."

if [ "$(docker ps -q -f name=elmordjane_db -f status=running)" ]; then
    print_success "Database container is running"
else
    print_error "Database container is not running"
    docker logs elmordjane_db --tail 20
    exit 1
fi

if [ "$(docker ps -q -f name=elmordjane_backend -f status=running)" ]; then
    print_success "Backend container is running"
else
    print_error "Backend container is not running"
    docker logs elmordjane_backend --tail 20
    exit 1
fi

if [ "$(docker ps -q -f name=elmordjane_frontend -f status=running)" ]; then
    print_success "Frontend container is running"
else
    print_error "Frontend container is not running"
    docker logs elmordjane_frontend --tail 20
    exit 1
fi

echo ""
print_step "Testing frontend health endpoint..."
sleep 5
if docker exec elmordjane_frontend wget -q -O- http://localhost:8080/health &> /dev/null; then
    print_success "Frontend health check passed"
else
    print_warning "Frontend health check failed - service may still be starting"
fi

echo ""
print_step "Verifying Traefik connection..."
if docker network inspect n8n_default &> /dev/null; then
    print_success "Traefik network (n8n_default) exists"
    if docker network inspect n8n_default | grep -q "elmordjane_frontend"; then
        print_success "Frontend container connected to Traefik network"
    else
        print_error "Frontend container NOT connected to Traefik network"
        print_warning "Run: docker network connect n8n_default elmordjane_frontend"
    fi
else
    print_error "Traefik network (n8n_default) not found"
    print_warning "Make sure Traefik is running and configured correctly"
fi

echo ""
print_step "Recent logs from frontend:"
docker logs elmordjane_frontend --tail 10

echo ""
echo "========================================"
print_success "Deployment completed!"
echo ""
echo "Next steps:"
echo "  1. Check your domain: https://dashboard.elmodjaneimmo.site"
echo "  2. Verify SSL certificate is valid (padlock icon)"
echo "  3. Test login and API functionality"
echo "  4. Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Troubleshooting:"
echo "  - See SSL-TROUBLESHOOTING.md for detailed help"
echo "  - Check Traefik logs if SSL not working"
echo "  - Verify DNS points to your server IP"
echo ""
echo "Container Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
