FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

RUN corepack enable && pnpm install --frozen-lockfile

RUN npx prisma generate

COPY . .

RUN pnpm run build

# ---- Production ----
FROM node:20-alpine AS production

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

RUN corepack enable && pnpm install --frozen-lockfile --prod

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
