#!/bin/bash

# Database Backup Script for ElMordjane-Immo
# Backs up PostgreSQL database and keeps last 7 days of backups

set -e

# Configuration
BACKUP_DIR="$HOME/backups/elmordjane-immo"
CONTAINER_NAME="elmordjane_db"
DB_USER="sauzxa"
DB_NAME="ElMordjanDb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🗄️  Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if container is running
if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo -e "${RED}❌ Database container is not running!${NC}"
    exit 1
fi

# Perform backup
echo "📦 Creating backup: $BACKUP_FILE"
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > "$BACKUP_FILE"

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

# Check if backup was successful
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo "   File: $BACKUP_FILE"
    echo "   Size: $SIZE"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

# Delete backups older than 7 days
echo "🧹 Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete

# List recent backups
echo ""
echo "📋 Recent backups:"
ls -lh "$BACKUP_DIR" | tail -n 10

echo ""
echo -e "${GREEN}✅ Backup process completed!${NC}"
