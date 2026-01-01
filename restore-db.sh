#!/bin/bash

# Database Restore Script for ElMordjane-Immo
# Restores PostgreSQL database from a backup file

set -e

# Configuration
CONTAINER_NAME="elmordjane_db"
DB_USER="sauzxa"
DB_NAME="ElMordjanDb"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "$HOME/backups/elmordjane-immo/" 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if container is running
if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo -e "${RED}❌ Database container is not running!${NC}"
    exit 1
fi

# Warning
echo -e "${YELLOW}⚠️  WARNING: This will replace the current database!${NC}"
read -p "Are you sure you want to continue? (yes/no) " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo "🗄️  Starting database restore..."

# Decompress if needed
TEMP_FILE=""
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Decompressing backup..."
    TEMP_FILE="/tmp/restore_$(date +%s).sql"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Stop backend to prevent connections
echo "🛑 Stopping backend..."
docker-compose -f docker-compose.prod.yml stop backend

# Restore database
echo "📥 Restoring database..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER $DB_NAME < "$RESTORE_FILE"

# Clean up temp file
if [ -n "$TEMP_FILE" ]; then
    rm -f "$TEMP_FILE"
fi

# Restart backend
echo "🚀 Starting backend..."
docker-compose -f docker-compose.prod.yml start backend

echo -e "${GREEN}✅ Database restored successfully!${NC}"
echo "   From: $BACKUP_FILE"
