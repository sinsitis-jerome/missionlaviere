# Tâches du foyer

Application pour créer les tâches à faire à la maison, les prioriser et les
répartir entre les membres du foyer. Tout le monde voit le même tableau, mis
à jour en temps réel.

- **Tableau** avec trois colonnes (À faire / En cours / Terminée), triées par
  priorité puis par échéance.
- **Affectation** d'une tâche à un membre du foyer (ou à personne).
- **Priorités** (basse / normale / haute / urgente), **catégories**
  personnalisables (Ménage, Courses, Bricolage…) et **échéances**.
- **Tâches récurrentes** (tous les X jours / semaines avec jours choisis /
  mois) : une nouvelle occurrence est créée automatiquement dès qu'une tâche
  récurrente est marquée terminée.
- **Commentaires** et **historique automatique** (créations, changements de
  statut, de priorité, d'affectation, d'échéance) sur chaque tâche.
- **Installable** sur le téléphone (PWA) — ajout à l'écran d'accueil, icône
  et écran de démarrage dédiés.
- Connexion avec un **compte Google**, foyers partagés par **code
  d'invitation**.

## Stack technique

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org),
  bundlé avec [Vite](https://vite.dev).
- [Firebase](https://firebase.google.com) : Authentification (Google) et
  Firestore (base de données temps réel) — offre gratuite ("Spark")
  largement suffisante pour un foyer.
- [Firebase Hosting](https://firebase.google.com/docs/hosting) pour la mise
  en ligne, avec déploiement automatique via GitHub Actions.
- [Vitest](https://vitest.dev) pour les tests de la logique métier
  (récurrence, tri, filtres).

## 1. Créer le projet Firebase

1. Allez sur la [console Firebase](https://console.firebase.google.com) et
   créez un nouveau projet (le plan gratuit Spark suffit).
2. **Authentification** : dans *Build > Authentication*, onglet
   *Sign-in method*, activez le fournisseur **Google**.
3. **Firestore** : dans *Build > Firestore Database*, cliquez sur *Créer une
   base de données*. Choisissez une région proche de chez vous, en **mode
   production** (les règles de sécurité du dépôt gèrent les accès).
4. **Application web** : dans *Paramètres du projet > Vos applications*,
   ajoutez une application Web (icône `</>`). Copiez les valeurs de
   `firebaseConfig` affichées : elles vous serviront à l'étape suivante.
5. Autorisez votre domaine de déploiement (et `localhost` pour le
   développement) dans *Authentication > Settings > Domaines autorisés*
   (Firebase Hosting y ajoute automatiquement son propre domaine).

## 2. Configurer le projet en local

```bash
npm install
cp .env.example .env.local
```

Remplissez `.env.local` avec les valeurs de `firebaseConfig` récupérées à
l'étape précédente :

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Lancez ensuite le serveur de développement :

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`. Tant que
`.env.local` n'est pas rempli, l'écran d'accueil affiche un message
expliquant ce qui manque, au lieu de planter.

## 3. Déployer les règles Firestore

Les règles de sécurité (`firestore.rules`) garantissent que seuls les
membres d'un foyer peuvent lire et modifier ses tâches. Installez l'outil en
ligne de commande Firebase puis déployez :

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # sélectionnez votre projet, alias "default"
firebase deploy --only firestore:rules,firestore:indexes
```

> **Note sur le modèle de sécurité** : pour permettre à quelqu'un de
> rejoindre un foyer avec un simple code d'invitation (sans passer par une
> fonction serveur), le document d'un foyer peut être *ouvert* par n'importe
> quel utilisateur connecté qui en connaît déjà l'identifiant technique
> (obtenu uniquement via un code d'invitation valide ou en étant déjà
> membre). Les *listes* de foyers, elles, restent strictement limitées aux
> membres. C'est un compromis raisonnable pour une application familiale ;
> voir `firestore.rules` pour le détail.

## 4. Déployer l'application (Firebase Hosting)

En local :

```bash
npm run build
firebase deploy --only hosting
```

### Déploiement automatique avec GitHub Actions

Le dépôt inclut deux workflows dans `.github/workflows/` :

- **`ci.yml`** : à chaque pull request, vérifie les types, le lint, les
  tests et le build.
- **`deploy.yml`** : à chaque push sur `main`, construit l'application et la
  déploie (règles Firestore + Hosting).

Pour activer le déploiement automatique, ajoutez ces secrets dans
*Settings > Secrets and variables > Actions* du dépôt GitHub :

| Secret | Valeur |
| --- | --- |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Les mêmes valeurs que dans `.env.local` |
| `FIREBASE_PROJECT_ID` | L'identifiant de votre projet Firebase |
| `FIREBASE_SERVICE_ACCOUNT` | Clé JSON d'un compte de service Firebase (voir ci-dessous) |

Pour générer `FIREBASE_SERVICE_ACCOUNT` : dans la console Firebase,
*Paramètres du projet > Comptes de service*, cliquez sur *Générer une
nouvelle clé privée*, puis collez le contenu du fichier JSON téléchargé
comme valeur du secret.

Mettez aussi à jour `.firebaserc` avec l'identifiant réel de votre projet
(`firebase use --add` le fait automatiquement).

## 5. Utilisation

1. La première personne se connecte avec Google et **crée le foyer**.
2. Dans *Réglages*, elle récupère le **code d'invitation** (6 caractères) et
   le partage avec le reste du foyer.
3. Chaque nouveau membre se connecte avec Google puis saisit ce code pour
   **rejoindre le foyer**.
4. N'importe quel membre peut créer des tâches, les affecter, changer leur
   priorité, leur statut, ajouter des commentaires, et consulter
   l'historique de chaque tâche.
5. Sur mobile, le navigateur propose d'**ajouter l'application à l'écran
   d'accueil** — elle se comporte alors comme une application installée.

## Développement

```bash
npm run dev          # serveur de développement
npm run typecheck    # vérification TypeScript
npm run lint         # oxlint
npm run test          # tests unitaires (Vitest)
npm run build         # build de production (dist/)
npm run preview       # sert le build de production en local
```

### Structure du projet

```
src/
  types/        Types partagés (Task, Household, Recurrence…)
  lib/          Logique métier pure et testée (récurrence, tri/filtrage,
                 messages d'historique, formatage de dates)
  firebase/      Accès à Firebase (auth, foyers, tâches, activité)
  context/       Contextes React (utilisateur connecté, foyer courant)
  components/    Composants d'interface réutilisables
  routes/        Pages (connexion, choix du foyer, tableau, réglages)
  styles/        Feuille de style de l'application
firestore.rules  Règles de sécurité Firestore
firebase.json    Configuration Hosting + Firestore
```

## Limites connues / pistes d'amélioration

- Pas de notifications push pour les échéances proches.
- Le glisser-déposer entre colonnes n'est pas implémenté (le changement de
  statut se fait depuis la fiche de la tâche).
- Les catégories sont un simple tableau de texte par foyer ; les supprimer
  ne modifie pas les tâches qui les utilisaient déjà.
