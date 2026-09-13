FROM node:20-alpine AS base

WORKDIR /app

# 의존성 설치
FROM base AS deps
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm ci

# 빌드 단계
FROM base AS builder
COPY package*.json ./
COPY apps/web/ ./apps/web/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

WORKDIR /app/apps/web
RUN npm run build

# 프로덕션 런타임
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/web

# 필요한 파일만 복사
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
