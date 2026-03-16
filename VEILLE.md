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

---

## Render

**Render** est une plateforme de déploiement cloud. Elle permet de déployer une application web sans avoir à gérer le serveur soi-même.

### render.yaml — Blueprint

C'est le fichier clé du projet. Il décrit l'infrastructure en code : ce qu'on déploie, comment on build, les variables d'environnement. Au lieu de tout configurer manuellement dans l'interface Render, on versionne la config dans un fichier YAML dans le repo.

C'est ce qu'on appelle l'**Infrastructure as Code** : l'infrastructure est décrite dans des fichiers texte, versionnés avec le code comme n'importe quel autre fichier.

### Sources

- https://render.com/docs
- https://render.com/docs/blueprint-spec

Socket.Io

Librairie qui fait de la comm en temps réel entre un client et un serveur. =/= Http lui c'est tjrs le client qui initie la requete.
Http n'est pas adapté pour certain service car devrait intérogré le serveur en permance pour savoir s'il y a du nouveau

Socket.IO repose sur le webSocket -> connexion ouverte et persistante entre client et serveur. Quand un message arrive le serveru le transmet a tout les client concernés.

Concepts clés:
. event: Socket.IO se base sur les event: on emet avec socket.emit et on ecoute avec socket.on
. Room: c'est un groupe de connexions, un client peut rejoindre une room et recevoir uniquement des message de cette room
. broadcast: envoie un message a tous les clients concernés sauf l'emetteur


Sources

https://socket.io/docs/v4/
https://socket.io/docs/v4/rooms/

---

## Socket.IO

Librairie qui fait de la communication en temps réel entre un client et un serveur. Contrairement à HTTP où c'est toujours le client qui initie la requête, Socket.IO permet au serveur d'envoyer des données au client à tout moment.

HTTP n'est pas adapté pour certains services car il faudrait interroger le serveur en permanence pour savoir s'il y a du nouveau, ce qui est inefficace.

Socket.IO repose sur les **WebSockets** : une connexion ouverte et persistante entre client et serveur. Quand un message arrive, le serveur le transmet instantanément à tous les clients concernés.

### Concepts clés

- **Event** : Socket.IO se base sur les événements. On émet avec `socket.emit` et on écoute avec `socket.on`
- **Room** : groupe de connexions. Un client peut rejoindre une room et recevoir uniquement les messages de cette room
- **Broadcast** : envoie un message à tous les clients connectés sauf l'émetteur

### Sources

- https://socket.io/docs/v4/
- https://socket.io/docs/v4/rooms/


SCSS et BEM 

Le Scss est une addition au css, cela ajout des fonctionnalité comme es variables, l'imbrications de selecteurs, les mixins (fonctions réutilisatble) et l'héritagees. Comme le navigateur ne comprend le scss directement,  la compilation se fait en css pendant le build

Cela permet d'ajouter une orga et réutilisabilité par rapport au css de base

Le BEM est une convention de nommage pour les classe css et est composé de 3 parties:
le block: qui est le composant indé
l'elem: qui est la partie d'un block
Modifier: variante d'un block ou d'un elem 

cela rend le code lisible et prévisible, tu sais immédiatement ce que la classe fait.

Sources

https://sass-lang.com/documentation
https://getbem.com

Veille · MD
Copier

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

Un **monorepo** (monolithic repository) c'est un seul repo Git qui contient plusieurs projets ou services distincts. Dans notre cas, le front (`/web`) et le back (`/api`) sont dans le même repo.

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

### Pourquoi dans ce projet ?

Le brief impose deux conteneurs : un pour `/api` et un pour `/web`. Cela permet de déployer les deux services de manière indépendante et reproductible sur Render.

### Sources

- https://docs.docker.com/get-started/
- https://docs.docker.com/reference/dockerfile/

---

## Dockerfile multi-stage

Normalement tout se passe dans une seule image : on installe les outils de build et tout reste dans l'image finale, donc on embarque des outils dont on n'a plus besoin en production.

En **multi-stage**, on découpe le build en plusieurs étapes. Chaque stage a un rôle précis et on ne garde dans l'image finale que ce qui est strictement nécessaire pour faire tourner l'app.

Dans notre projet :

- **builder** : installe toutes les dépendances (dont devDependencies) et compile le TypeScript en JavaScript
- **prod-deps** : installe uniquement les dépendances de production
- **final** : copie le `dist/` compilé + le `node_modules` de prod, rien d'autre

Les stages intermédiaires sont utilisés pendant le build puis jetés. L'image finale ne contient ni TypeScript, ni tsx, ni nodemon. Résultat : on est passé de ~342MB à ~250MB.

### Sources

- https://docs.docker.com/build/building/multi-stage/

---

## Nginx

**Nginx** (prononcé "engine-x") est un serveur web et un reverse proxy. Il sert des fichiers statiques (HTML, CSS, JS) et redirige les requêtes vers d'autres services.

On l'utilise pour le front car au moment du `pnpm build`, Vite génère un dossier `dist/` avec des fichiers statiques qui n'ont pas besoin de Node.js pour tourner — juste d'un serveur qui les distribue aux navigateurs.

Dans notre cas, le front et le back sont dans deux conteneurs séparés. Le navigateur ne connaît qu'une seule URL, et Nginx joue le rôle d'aiguilleur :

- Requête vers `/api/...` → redirigée vers le conteneur Express
- Requête vers `/socket.io/...` → redirigée vers le conteneur Express
- Tout le reste → sert les fichiers statiques React

On n'utilise pas Node.js pour servir le front car c'est utiliser un bazooka pour une fourmi. Nginx est conçu pour ça, ultra léger et très performant pour les fichiers statiques.

### Sources

- https://nginx.org/en/docs/
- https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/

---

## Render

**Render** est une plateforme de déploiement cloud. Elle permet de déployer une application web sans avoir à gérer le serveur soi-même.

### render.yaml — Blueprint

C'est le fichier clé du projet. Il décrit l'infrastructure en code : ce qu'on déploie, comment on build, les variables d'environnement. Au lieu de tout configurer manuellement dans l'interface Render, on versionne la config dans un fichier YAML dans le repo.

C'est ce qu'on appelle l'**Infrastructure as Code** : l'infrastructure est décrite dans des fichiers texte, versionnés avec le code comme n'importe quel autre fichier.

### Sources

- https://render.com/docs
- https://render.com/docs/blueprint-spec

---

## Socket.IO

Librairie qui fait de la communication en temps réel entre un client et un serveur. Contrairement à HTTP où c'est toujours le client qui initie la requête, Socket.IO permet au serveur d'envoyer des données au client à tout moment.

HTTP n'est pas adapté pour certains services car il faudrait interroger le serveur en permanence pour savoir s'il y a du nouveau, ce qui est inefficace.

Socket.IO repose sur les **WebSockets** : une connexion ouverte et persistante entre client et serveur. Quand un message arrive, le serveur le transmet instantanément à tous les clients concernés.

### Concepts clés

- **Event** : Socket.IO se base sur les événements. On émet avec `socket.emit` et on écoute avec `socket.on`
- **Room** : groupe de connexions. Un client peut rejoindre une room et recevoir uniquement les messages de cette room
- **Broadcast** : envoie un message à tous les clients connectés sauf l'émetteur

### Sources

- https://socket.io/docs/v4/
- https://socket.io/docs/v4/rooms/

---

## SCSS et BEM

**SCSS** est une addition au CSS. Il ajoute des fonctionnalités comme les variables, l'imbrication de sélecteurs, les mixins (fonctions réutilisables) et l'héritage. Le navigateur ne comprend pas le SCSS directement, la compilation se fait en CSS pendant le build.

Cela permet d'ajouter une organisation et une réutilisabilité qui manquent au CSS de base.

**BEM** (Block Element Modifier) est une convention de nommage pour les classes CSS, composée de 3 parties :

- **Block** : le composant indépendant (ex: `.chat`)
- **Element** : la partie d'un block (ex: `.chat__message`)
- **Modifier** : variante d'un block ou d'un element (ex: `.chat__message--own`)

Cela rend le code lisible et prévisible : en voyant le nom d'une classe tu sais immédiatement ce qu'elle représente et à quel composant elle appartient.

### Sources

- https://sass-lang.com/documentation
- https://getbem.com

## Tests unitaires

Un **test unitaire** est un test automatisé qui vérifie le comportement d'une 
seule unité de logique — généralement une fonction ou une méthode — de manière 
isolée du reste de l'application.

L'objectif est de s'assurer que chaque fonction fait exactement ce qu'elle est 
censée faire, indépendamment des autres.

### Pourquoi pas des tests manuels ?

Les tests manuels sont lents, coûteux et non reproductibles : deux personnes 
peuvent tester différemment, et on ne les relance pas après chaque commit. 
Les tests unitaires automatisés sont toujours identiques, s'exécutent en 
quelques millisecondes et peuvent tourner à chaque modification du code.

### L'acronyme FIRST

Un bon test unitaire doit respecter cinq principes :

- **Fast** : s'exécute rapidement (millisecondes), pour ne pas ralentir le 
  développement
- **Isolated** : ne dépend d'aucune ressource externe (BDD, réseau, filesystem). 
  Si une dépendance est nécessaire, on la remplace par un mock
- **Repeatable** : donne toujours le même résultat peu importe l'environnement 
  ou le nombre d'exécutions
- **Self-validating** : le test dit lui-même s'il passe ou échoue — pas besoin 
  d'un humain pour interpréter le résultat
- **Timely** : écrit au bon moment — en TDD, cela signifie *avant* le code 
  qu'il teste

### Isolation et mocks

Comme le test doit être isolé, si la fonction testée dépend d'autre chose 
(une BDD, une API, une autre fonction), on remplace cette dépendance par un 
**mock** : une fausse version contrôlée qui simule le comportement attendu 
sans faire appel à la vraie ressource.

### Sources

- https://vitest.dev/guide/
- https://martinfowler.com/bliki/UnitTest.html

## TDD — Test Driven Development

Le **TDD** est une méthodologie de développement qui consiste à écrire les 
tests *avant* le code. Ce n'est pas juste une question d'ordre : écrire le 
test en premier force à réfléchir à l'interface de la fonction avant même 
de l'implémenter.

### Le cycle Red → Green → Refactor

Le TDD se déroule en courtes itérations répétées :

- **Red** : on écrit un test qui décrit un comportement attendu. Il échoue 
  immédiatement — c'est normal, le code n'existe pas encore
- **Green** : on écrit le minimum de code nécessaire pour que le test passe. 
  Pas plus, pas moins
- **Refactor** : on nettoie et améliore la structure du code (renommage, 
  suppression de duplication, extraction de fonction...) sans changer son 
  comportement. Les tests qui passent toujours confirment qu'on n'a rien cassé

### Pourquoi des petites itérations ?

En avançant par petits pas vérifiés, on sait à tout moment que ce qui est 
déjà écrit fonctionne. Si un test échoue, le problème vient forcément du 
peu de code qu'on vient d'ajouter — pas de 50 lignes écrites d'un coup. 
Les bugs sont localisés immédiatement.

### TDD vs "tester après"

Sans TDD, on écrit tout le code puis on teste. Si ça ne marche pas, il faut 
tout relire pour trouver l'erreur. De plus, on peut se retrouver avec du code 
difficile à tester car trop couplé — on n'y a pas pensé pendant la conception.

En TDD, écrire le test en premier oblige à se poser les bonnes questions 
dès le départ : *"Quels paramètres prend ma fonction ? Que retourne-t-elle ?"*. 
Les tests guident la conception et garantissent que le code est testable 
par construction.

### Sources

- https://martinfowler.com/bliki/TestDrivenDevelopment.html
- https://vitest.dev/guide/

## Vitest

**Vitest** est un framework de tests unitaires pour les projets JavaScript et 
TypeScript. Il joue le même rôle que Jest — écrire et exécuter des tests 
automatisés — mais est conçu spécifiquement pour les projets utilisant Vite.

### Pourquoi Vitest plutôt que Jest ?

Notre projet utilise Vite comme bundler. Vitest réutilise directement la 
config Vite existante — pas besoin de reconfigurer un bundler séparé pour 
les tests. Avec Jest, il faudrait une configuration supplémentaire pour 
gérer TypeScript, les imports et les alias, tout ce que Vite prend déjà 
en charge.

### Structure d'un test

Un test Vitest s'écrit toujours avec trois éléments :

- **`describe`** : regroupe les tests d'une même fonction ou feature
- **`it`** / **`test`** : décrit un cas précis à tester (les deux sont 
  identiques, juste une question de lisibilité)
- **`expect`** : l'assertion — ce que le résultat est censé être
```js
describe("checkWin", () => {
  it("retourne true si le joueur a trois cases alignées", () => {
    expect(checkWin(board)).toBe(true)
  })
})
```

### Les matchers courants

Les matchers définissent la condition à vérifier :

- **`toBe`** : compare par référence (`===`). Pour les primitives : 
  booléens, nombres, strings
- **`toEqual`** : compare par valeur. Indispensable pour les objets et 
  les tableaux car deux tableaux identiques ne sont pas `===`
- **`toThrow`** : vérifie qu'une fonction lève bien une erreur
- **`toBeTruthy`** / **`toBeFalsy`** : vérifie qu'une valeur est 
  truthy ou falsy

### Lancer les tests
```bash
pnpm test          # lance les tests une fois
pnpm test --watch  # relance automatiquement à chaque modification
```

### Sources

- https://vitest.dev/guide/
- https://vitest.dev/api/expect.html