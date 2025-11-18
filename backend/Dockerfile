FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client for production
RUN npx prisma generate

# Copy built files from base stage
COPY --from=base /app/dist ./dist

# Copy seed script for initialization
COPY --from=base /app/src/db ./src/db

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
