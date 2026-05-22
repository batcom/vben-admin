FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-antd/package.json ./apps/web-antd/
COPY internal/ ./internal/
COPY packages/ ./packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @vben/web-antd build

# ---- Production ----
FROM nginx:alpine AS production

COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
