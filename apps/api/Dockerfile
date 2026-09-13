FROM node:20-alpine AS base

WORKDIR /app

# 의존성 설치
FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci

# 빌드 단계
FROM base AS builder
COPY package*.json ./
COPY apps/api/ ./apps/api/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

WORKDIR /app/apps/api
RUN npm run build

# 프로덕션 런타임
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/api

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/node_modules ../node_modules

RUN npm ci --only=production

EXPOSE 3001
ENV PORT=3001

CMD ["node", "dist/main.js"]
