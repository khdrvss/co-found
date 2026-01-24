# Stage 1: Build the frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Receive the VITE_GOOGLE_CLIENT_ID as a build argument
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-}

# Build Vite app to /app/dist
RUN npm run build

# Stage 2: Production Image
FROM node:20-alpine

WORKDIR /app

# Install all dependencies (including dev deps for build)
COPY package*.json ./
RUN npm ci

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy backend and config files
COPY src ./src
COPY migrations ./migrations
COPY schema.sql ./
COPY tsconfig*.json ./
COPY tsconfig.server.json ./
COPY prisma ./prisma
COPY docs ./docs

# Create uploads directory
RUN mkdir -p uploads

# Fix permissions (no need to build server, we use tsx)
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Environment setup
ENV NODE_ENV=production
ENV PORT=4000

# Expose the port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start the server with tsx
CMD ["npm", "start"]
