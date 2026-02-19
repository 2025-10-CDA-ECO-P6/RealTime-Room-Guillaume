# RealTime Room

Application de chat temps réel pour une startup événementielle.  
Stack : React + Vite (front) / Express + Socket.IO (back) / Nginx / Docker / Render

---

## Architecture
```
.
├── web/          # Front React + Vite + SCSS
├── api/          # Back Express + Socket.IO
├── docker-compose.yml
├── render.yaml
└── nginx.conf
```

## Prérequis

- Node.js 22+
- pnpm 10+
- Docker + Docker Compose

## Installation
```bash
pnpm install
```

## Développement local
```bash
# Lancer front et back séparément
cd api && pnpm dev
cd web && pnpm dev

# Ou via Docker Compose
docker compose up --build
```

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| PORT | Port de l'API | 3001 |

## Déploiement

Les deux services sont déployés sur Render via Docker :
- API : https://realtime-room-guillaume.onrender.com
- Web : (url du front)

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /health | Vérifie que l'API tourne |