# Backend Dockerfile
FROM node:24.11.0-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ky/package.json ./packages/ky/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @graph-mind/backend...

# Build the app
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/ky/node_modules ./packages/ky/node_modules

# Copy source files
COPY . .

# Build backend
WORKDIR /app/apps/backend
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

# Copy built application
COPY --from=builder --chown=backend:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/apps/backend/package.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown backend:nodejs /app/logs

USER backend

EXPOSE 3000

CMD ["node", "--env-file=.env", "dist/index.js"]
