# Stage 1 - Build : compile le TypeScript en JavaScript
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
RUN npm install -g pnpm && pnpm install --frozen-lockfile --filter api --prod=false
COPY api/ ./api/
RUN cd api && ./node_modules/.bin/tsc

# Stage 2 - Prod deps : installe uniquement les dépendances de production
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
RUN npm install -g pnpm && pnpm install --frozen-lockfile --filter api --prod --node-linker=hoisted

# Stage 3 - Final
FROM node:22-alpine
WORKDIR /app/api
COPY --from=builder /app/api/dist ./dist
COPY --from=prod-deps /app/node_modules ../node_modules
EXPOSE 3001
CMD ["node", "dist/index.js"]