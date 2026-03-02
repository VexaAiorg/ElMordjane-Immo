# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Use Yarn Berry (v4) to match the project's lockfile format
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies
RUN yarn install --immutable

# Copy source code and prisma
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY tsconfig.json ./
COPY server.ts ./
COPY app.ts ./

# Generate Prisma Client
RUN yarn prisma generate

# Build TypeScript code
RUN yarn build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy package metadata
COPY package.json ./

# Copy built artifacts and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Set entrypoint and command
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
