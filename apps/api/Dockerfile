# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json tsconfig.base.json ./

# Copy only api workspace (and shared if needed)
COPY apps/api/ apps/api/
COPY packages/ packages/

# Install all dependencies (workspace-aware)
RUN npm ci --workspace=apps/api

# Build TypeScript → JavaScript
RUN npm run build --workspace=apps/api

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy workspace root
COPY package.json package-lock.json ./

# Copy built API
COPY --from=builder /app/apps/api/dist/ apps/api/dist/
COPY --from=builder /app/apps/api/package.json apps/api/package.json

# Copy shared packages (if compiled)
COPY --from=builder /app/packages/ packages/

# Copy migration files (needed for migrate:up at runtime)
COPY apps/api/src/infrastructure/database/migrations/ apps/api/src/infrastructure/database/migrations/

# Install production dependencies only
RUN npm ci --workspace=apps/api --omit=dev

# Switch to non-root
USER appuser

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

CMD ["node", "apps/api/dist/server.js"]
