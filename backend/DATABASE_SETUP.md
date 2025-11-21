# Database Setup Guide - PostgreSQL + Prisma

## Prerequisites

- PostgreSQL installed locally or access to a PostgreSQL database
- Node.js and Yarn installed

## Environment Setup

1. Create a `.env` file in the backend directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/elmordjane_immo?schema=public"

# Server
PORT=3000
NODE_ENV=development

# Cloudinary (optional - for image uploads)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
```

Replace `username`, `password`, and database name with your PostgreSQL credentials.

## Database Setup Steps

### 1. Create the PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE elmordjane_immo;

# Exit psql
\q
```

### 2. Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

## Available Prisma Commands

- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate dev` - Create and apply migrations in development
- `npx prisma migrate deploy` - Apply migrations in production
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes without migrations (for prototyping)
- `npx prisma db seed` - Run seed scripts

## Using Prisma in Your Code

```typescript
import prisma from './src/lib/prisma.js';

// Example: Create a property
const property = await prisma.property.create({
  data: {
    title: 'Beautiful Villa',
    description: 'A stunning villa with ocean views',
    price: 500000,
    type: 'VILLA',
    status: 'AVAILABLE',
  }
});

// Example: Find all properties
const properties = await prisma.property.findMany({
  where: {
    status: 'AVAILABLE'
  }
});
```

## Notes

- The Prisma Client is generated in `src/generated/prisma`
- Schema file is located at `prisma/schema.prisma`
- Migrations are stored in `prisma/migrations`
- Always run `prisma generate` after changing the schema

