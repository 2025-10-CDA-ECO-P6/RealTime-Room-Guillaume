# VEILLE.md

## pnpm

**pnpm** (Performant Node Package Manager) est un gestionnaire de paquets pour Node.js, comme npm ou yarn.
Il sert à installer, gérer et partager les dépendances d'un projet JavaScript ou TypeScript.

### Pourquoi pas npm ?

npm copie chaque dépendance dans le `node_modules` de chaque projet. Par exemple, si on a 10 projets React, React est téléchargé 10 fois sur la machine.

pnpm utilise un **store global unique** : chaque librairie n'est téléchargée qu'une seule fois, puis pnpm crée des "raccourcis" (liens symboliques) depuis le `node_modules` de chaque projet vers ce store. Résultat : installation plus rapide et moins de place utilisée sur le disque.

### Pourquoi dans ce projet ?

pnpm permet de gérer facilement un **monorepo** en déclarant que plusieurs dossiers font partie du même projet via `pnpm-workspace.yaml`. Cela permet de :

- Partager les dépendances communes entre les packages (`/web` et `/api`)
- Lancer des scripts sur tous les packages depuis la racine
- Gérer un seul `pnpm-lock.yaml` pour l'ensemble du projet

### Sources

- https://pnpm.io/motivation
- https://pnpm.io/workspaces

---

## Monorepo

Un **monorepo** (monolithic repository) c'est un seul repo Git qui contient plusieurs projets ou services distincts.

### Pourquoi pas deux repos séparés ?

Avec deux repos séparés :

- Tu dois gérer deux contextes Git, deux CI/CD, deux sets de conventions
- Si tu changes une interface partagée (exemple : un type de message Socket.IO), tu dois mettre à jour les deux repos manuellement
- La cohérence entre front et back est plus difficile à garantir
- Pour un nouveau dev c'est plus lourd : il faut cloner deux repos et configurer deux environnements

### Avantages du monorepo

- Un seul repo à cloner, une seule CI, une seule config ESLint pour tout le projet
- Cohérence garantie : le `pnpm-lock.yaml` est commun, les versions des dépendances partagées sont alignées
- Un seul `pnpm dev` depuis la racine peut lancer le front et le back simultanément
- On voit d'un seul coup d'œil l'état de tout le projet

### Sources

- https://pnpm.io/workspaces
- https://monorepo.tools

---

## Express

**Express** est un framework web pour Node.js. Il permet de créer un serveur HTTP en JS/TS et d'exposer des routes que le front ou d'autres services peuvent appeler.

De base, Node.js permet de créer un serveur HTTP mais c'est verbeux et bas niveau. Express simplifie ça en ajoutant :

- Un système de **routing** : définit comment ton serveur répond à une requête client vers un endpoint spécifique. On définit deux choses — une méthode HTTP (`GET`, `POST`, `PUT`, `DELETE`) et un chemin (ex: `/health`, `/user`)
- Des **middlewares** : fonctions qui s'exécutent entre la réception de la requête et l'envoi de la réponse (ex: Helmet, rate limiter, validation des données). Si tu les branches sur un serveur Express, ils s'exécutent automatiquement à chaque requête
- Une gestion simplifiée des requêtes/réponses

### Pourquoi dans ce projet ?

On a besoin d'un serveur back pour exposer le endpoint `/health` (obligatoire J1), la doc Swagger sur `/api-docs`, et pour gérer la connexion Socket.IO pour le chat temps réel.

### Sources

- https://expressjs.com
- https://expressjs.com/en/guide/using-middleware.html