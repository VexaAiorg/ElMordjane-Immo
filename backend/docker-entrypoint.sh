#!/bin/sh
set -e

echo " Running database migrations..."

# Run Prisma migrations
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed"
    exit 1
fi

echo "🚀 Starting application..."

# Start the application
exec "$@"
