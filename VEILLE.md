# VEILLE.md

## pnpm

**pnpm** (Performant Node Package Manager) est un gestionnaire de paquets pour Node.js, comme npm ou yarn.
Il sert à installer, gérer et partager les dépendances d'un projet JavaScript ou TypeScript.

### Pourquoi pas npm ?

npm copie chaque dépendance dans le `node_modules` de chaque projet. Par exemple, si on a 10 projets React, React est téléchargé 10 fois sur la machine.

pnpm utilise un **store global unique** : chaque librairie n'est téléchargée qu'une seule fois, puis pnpm crée des "raccourcis" (liens symboliques) depuis le `node_modules` de chaque projet vers ce store. Résultat : installation plus rapide et moins de place utilisée sur le disque.

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

### Sources

- https://expressjs.com
- https://expressjs.com/en/guide/using-middleware.html


---

## Docker

Docker permet d'emballer une application avec tout ce dont elle a besoin pour tourner (code, dépendances, configuration, version de Node...) dans un **conteneur**. Ce conteneur tourne de manière identique sur toutes les machines.

### Pourquoi ?

Tout le monde a des environnements différents : OS, version de Node, variables d'environnement... Certains bugs n'existent que sur certaines machines. Docker isole l'application dans un environnement reproductible et identique partout.

### Conteneur vs Image

L'image c'est le moule et le conteneur c'est le gâteau (comme une classe et un objet). Tu peux lancer plusieurs conteneurs depuis la même image.

### Dockerfile

C'est le fichier qui décrit comment construire l'image. Il contient :

- La base de départ (ex: `node:20-alpine`)
- Les fichiers à copier
- Les commandes à exécuter (installer les dépendances, builder...)
- La commande de démarrage

### Sources

- https://docs.docker.com/get-started/
- https://docs.docker.com/reference/dockerfile/

---

## Dockerfile multi-stage

Normalement tout se passe dans une seule image : on installe les outils de build et tout reste dans l'image finale, donc on embarque des outils dont on n'a plus besoin en production.

En **multi-stage**, on découpe le build en plusieurs étapes. Chaque stage a un rôle précis et on ne garde dans l'image finale que ce qui est strictement nécessaire pour faire tourner l'app.

Les stages intermédiaires sont utilisés pendant le build puis jetés. L'image finale est donc beaucoup plus légère.

### Sources

- https://docs.docker.com/build/building/multi-stage/

---

## Nginx

**Nginx** (prononcé "engine-x") est un serveur web et un reverse proxy. Il sert des fichiers statiques (HTML, CSS, JS) et redirige les requêtes vers d'autres services.

On l'utilise pour le front car au moment du `pnpm build`, Vite génère un dossier `dist/` avec des fichiers statiques qui n'ont pas besoin de Node.js pour tourner — juste d'un serveur qui les distribue aux navigateurs.

Ici, le front et le back sont dans deux conteneurs séparés. Le navigateur ne connaît qu'une seule URL, et Nginx joue le rôle d'aiguilleur :

- Requête vers `/api/...` → redirigée vers le conteneur Express
- Requête vers `/socket.io/...` → redirigée vers le conteneur Express
- Tout le reste → sert les fichiers statiques React

On n'utilise pas Node.js pour servir le front car c'est utiliser un bazooka pour une fourmi. Nginx est conçu pour ça, ultra léger et très performant pour les fichiers statiques.

### Sources

- https://nginx.org/en/docs/
- https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/