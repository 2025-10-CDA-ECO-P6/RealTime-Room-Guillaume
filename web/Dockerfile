# Stage 1 - Build : compile React avec Vite
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/
RUN npm install -g pnpm && pnpm install --frozen-lockfile --filter web
COPY web/ ./web/
RUN cd web && pnpm build

# Stage 2 - Final : sert les fichiers statiques avec Nginx
FROM nginx:alpine
COPY --from=builder /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]