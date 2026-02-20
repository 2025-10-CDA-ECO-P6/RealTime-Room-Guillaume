# Stage 1 - Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/
RUN npm install -g pnpm && pnpm install --frozen-lockfile --filter web
COPY web/ ./web/
ARG VITE_API_URL
RUN cd web && VITE_API_URL=$VITE_API_URL pnpm build

# Stage 2 - Final
FROM nginx:alpine
COPY --from=builder /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]