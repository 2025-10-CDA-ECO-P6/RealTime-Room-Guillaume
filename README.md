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
│   │   ├── styles/       # SCSS/BEM
│   │   ├── socket.ts     # Instance Socket.IO client
│   │   └── App.tsx
│   ├── nginx.conf        # Config Nginx (proxy + static)
│   └── Dockerfile
├── api/                  # Back Express + Socket.IO
│   ├── src/
│   │   ├── game/         # Logique métier Flip 7
│   │   │   ├── flip7.ts
│   │   │   └── flip7.test.ts
│   │   └── index.ts      # Serveur Express + Socket.IO
│   └── Dockerfile
├── docker-compose.yml
├── render.yaml
└── pnpm-workspace.yaml
```

## Mini-jeu : Flip 7

Flip 7 est un jeu de push-your-luck intégré à l'application.

### Règles
- Piochez des cartes numérotées (0 à 12) pour accumuler des points
- Si vous piochez un numéro déjà en main → vous bustez et perdez vos points
- Si vous collectez 7 cartes différentes → Flip 7 ! +15 points bonus
- Le premier joueur à atteindre 200 points remporte la partie

### Calcul du score
1. Somme des cartes numéro
2. x2 si vous avez la carte bonus x2
3. Ajout des bonus fixes (+2, +4, +6, +8, +10)
4. +15 points si Flip 7

---

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

## Tests

### Lancer les tests
```bash
cd api && pnpm test         # lance les tests une fois
cd api && pnpm test --watch # relance à chaque modification
```

### Démarche TDD

La logique métier du jeu a été développée en TDD :
- Chaque règle du jeu est introduite par un test unitaire
- Le cycle Red → Green → Refactor est respecté à chaque itération
- La logique est isolée dans `api/src/game/flip7.ts`
- Les tests sont dans `api/src/game/flip7.test.ts`

---

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
- Mini-jeu Flip 7 intégré
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