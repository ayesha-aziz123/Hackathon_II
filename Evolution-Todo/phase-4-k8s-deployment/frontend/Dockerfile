# Stage 1: Dependencies (production only)
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install --save-dev typescript

# Build Next.js app
RUN npm run build

# Stage 3: Production runner (minimal image)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy essential standalone files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static/ ./.next/static/

# Public folder agar hai to copy karo (agar nahi to comment out kar de)
# COPY --from=builder --chown=nextjs:nodejs /app/public/ ./public/

USER nextjs

EXPOSE 3000

# Healthcheck simple bana diya (wget nahi chahiye ab)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1  # agar fail ho to bhi ignore kar sakti

# Ya healthcheck ko comment out kar de agar issue bar bar aye
# HEALTHCHECK NONE

CMD ["node", "server.js"]