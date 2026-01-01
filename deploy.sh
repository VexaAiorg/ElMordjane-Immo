#!/bin/bash

# ElMordjane-Immo Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting ElMordjane-Immo Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    print_info "Please create .env.production from .env.production.example"
    exit 1
fi

print_info "Loading environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

# Pull latest changes from Git (optional)
read -p "Pull latest changes from Git? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Pulling latest changes..."
    git pull origin main || print_error "Git pull failed (continuing anyway)"
fi

# Stop running containers
print_info "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional)
read -p "Remove old Docker images? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Removing old images..."
    docker-compose -f docker-compose.prod.yml down --rmi all
fi

# Build new images
print_info "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start containers
print_info "Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check if containers are running
if [ "$(docker ps -q -f name=elmordjane_db)" ]; then
    print_success "Database container is running"
else
    print_error "Database container failed to start"
    docker logs elmordjane_db
    exit 1
fi

if [ "$(docker ps -q -f name=elmordjane_backend)" ]; then
    print_success "Backend container is running"
else
    print_error "Backend container failed to start"
    docker logs elmordjane_backend
    exit 1
fi

if [ "$(docker ps -q -f name=elmordjane_frontend)" ]; then
    print_success "Frontend container is running"
else
    print_error "Frontend container failed to start"
    docker logs elmordjane_frontend
    exit 1
fi

# Show container status
print_info "Container Status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
print_info "Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=50

print_success "Deployment completed successfully! 🎉"
print_info "Access your application at: https://${DOMAIN}"
print_info "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
