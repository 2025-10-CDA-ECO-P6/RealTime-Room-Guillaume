# RealTime Room

Application de chat temps réel pour une startup événementielle.  
Stack : React + Vite (front) / Express + Socket.IO (back) / Nginx / Docker / Render

---

## Architecture

```
.
├── web/                  # Front React + Vite + SCSS
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── socket.ts     # Instance Socket.IO client
│   │   └── App.tsx
│   ├── nginx.conf        # Config Nginx (proxy + static)
│   └── Dockerfile
├── api/                  # Back Express + Socket.IO
│   ├── src/
│   │   └── index.ts      # Serveur Express + Socket.IO
│   └── Dockerfile
├── docker-compose.yml
├── render.yaml
└── pnpm-workspace.yaml
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
cd api && pnpm dev   # API sur http://localhost:3001
cd web && pnpm dev   # Front sur http://localhost:5173

# Ou via Docker Compose (simule la prod)
docker compose up --build
```

## Variables d'environnement

### API (`api/`)

| Variable | Description | Défaut |
|----------|-------------|--------|
| PORT | Port de l'API | 3001 |

### Web (`web/`)

| Variable | Description | Défaut |
|----------|-------------|--------|
| VITE_API_URL | URL de l'API pour Socket.IO | http://localhost:3001 |
| API_URL | URL de l'API pour le proxy Nginx | http://api:3001 |

> `VITE_API_URL` est injectée au moment du build Docker via `ARG`.  
> En production sur Render, elle pointe vers l'URL publique de l'API.  
> En local avec Docker Compose, `API_URL=http://api:3001` permet à Nginx de proxyfier vers le conteneur Express.

## Fonctionnel

- Rejoindre une room avec un pseudo
- Envoyer et recevoir des messages en temps réel
- Pas de persistance (assumé et documenté)

## Déploiement

Les deux services sont déployés sur Render via Docker :
- API : https://realtime-room-guillaume.onrender.com
- Web : https://realtime-room-web-e697.onrender.com

Le déploiement est automatique à chaque push sur `main` grâce à `autoDeploy: true` dans `render.yaml`.

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /health | Vérifie que l'API tourne |

## Events Socket.IO

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| join_room | client → serveur | `room: string` | Rejoindre une room |
| send_message | client → serveur | `{ room, pseudo, message }` | Envoyer un message |
| receive_message | serveur → client | `{ room, pseudo, message }` | Recevoir un message |