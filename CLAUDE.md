# Nuit d'Encre

Plateforme sociale de bibliothèque en ligne (SPA + API GraphQL) permettant aux utilisateurs de gérer leurs lectures, découvrir des livres, écrire des critiques, recommander des ouvrages et progresser via un système de gamification (XP, niveaux, titres).

## Commands

### Développement (depuis la racine)

```bash
docker compose up --build   # Démarre tous les services (frontend, backend, BDD)
docker compose up           # Démarre sans rebuild
docker compose down         # Arrête les services

pnpm --filter backend test  # Tests d'un seul workspace depuis la racine
pnpm --filter frontend test
pnpm format                 # Prettier sur app/*/src (format:check en CI)
```

Avant de pousser, ce que la CI vérifiera : `pnpm format:check` (racine), `pnpm lint` + `pnpm test` dans les deux workspaces, `pnpm build` (front) et `pnpm exec tsc --noEmit` (back).

### Frontend (`app/frontend/`)

```bash
pnpm dev       # Dev server sur le port 5173
pnpm build     # Build TypeScript + Vite
pnpm test      # Suite Vitest
pnpm lint      # ESLint (--max-warnings 0)
pnpm preview   # Prévisualisation du build
```

### Backend (`app/backend/`)

```bash
pnpm start          # Dev server avec ts-node-dev (hot reload)
pnpm test           # Suite Jest
pnpm lint           # ESLint (src/, --max-warnings 0)
pnpm build          # Compile TypeScript → dist/
pnpm start:prod     # Démarre le serveur compilé
pnpm seed:books     # Seed de données livres
pnpm seed:db        # Seed de démo complet (utilisateurs, follows, critiques, commentaires…)
```

### Roadmap

La roadmap à jour (état, benchmark des applis concurrentes, paliers) est dans `docs/2026-05-31-review-technique-et-roadmap.md`. La tenir à jour quand une fonctionnalité est livrée.

## Architecture

```
Nuit-d-Encre/
├── app/
│   ├── frontend/                         # React 19 + Vite SPA
│   │   └── src/
│   │       ├── App.tsx                   # Layout racine (sidebar + contenu + toasts)
│   │       ├── main.tsx                  # Point d'entrée (StrictMode, HelmetProvider, Apollo, Auth)
│   │       ├── components/
│   │       │   ├── sections/             # Composants fonctionnels par domaine
│   │       │   │   ├── book/             # Cartes livre, formulaires, critiques, recommandations
│   │       │   │   ├── author/           # Cartes auteur, formulaires
│   │       │   │   ├── library/          # Bibliothèque utilisateur, favoris (favoriteBook/)
│   │       │   │   ├── profile/          # Page profil : hero, stats, progression, favoris, édition (editProfile/, hero/)
│   │       │   │   ├── admin/            # Panel admin : onglets (tabs/), banners/, categories/, reviews/, dashboard/, ui/
│   │       │   │   ├── shared/           # Primitives partagées entre pages détail (Diamond via UI, CollectionSeam, SectionHairline, FicheManagementBar, Notice)
│   │       │   │   ├── sidebar/          # Navigation latérale (collapsible, localStorage)
│   │       │   │   ├── auth/             # Formulaires connexion/inscription
│   │       │   │   └── form/             # Champs de formulaire partagés
│   │       │   ├── UI/                   # Composants UI réutilisables
│   │       │   │   ├── form/             # Inputs, selects (CVA-based)
│   │       │   │   ├── skeleton/         # Squelettes de chargement par page
│   │       │   │   ├── Button/           # Composant bouton avec variantes CVA
│   │       │   │   ├── Banner/           # Bannière contextuelle (XP, completion)
│   │       │   │   └── ErrorElement.tsx  # Composant d'erreur global (404, etc.)
│   │       │   └── hoc/                  # Higher-order components (guards de route)
│   │       │       ├── ProtectedRoute.tsx  # Requiert authentification
│   │       │       ├── PublicRoute.tsx     # Redirige si déjà connecté
│   │       │       └── AdminRoute.tsx      # Requiert rôle admin
│   │       ├── pages/                    # Composants de page liés aux routes
│   │       │   ├── books/                # Books, BookDetails, BookScribe, BookUpdate, BookPreview
│   │       │   ├── authors/              # Authors, AuthorDetails, AuthorScribe, AuthorUpdate
│   │       │   ├── Auth.tsx              # Page login/register
│   │       │   ├── UserLibrary.tsx       # Bibliothèque personnelle
│   │       │   ├── UserProfile.tsx       # Profil utilisateur (public + privé) — implémenté + câblé
│   │       │   ├── Admin.tsx             # Panel admin (7 onglets + analytics) — implémenté + câblé
│   │       │   └── TermsOfUse.tsx
│   │       ├── hooks/                    # Custom React hooks organisés par domaine
│   │       │   ├── book/                 # useBookData, useBookMutations, etc.
│   │       │   ├── author/               # useAuthorData, useAuthorMutations
│   │       │   ├── userBook/             # useUserBooksData, useUserBookMutations
│   │       │   ├── category/             # useCategoryData
│   │       │   ├── auth/                 # useAuthContext
│   │       │   ├── responsive/           # useMediaQuery (+ useIsBelow/useIsAbove)
│   │       │   ├── storage/              # useLocalStorage
│   │       │   ├── toast/                # useToast
│   │       │   └── search/               # useDebounce
│   │       ├── graphql/                  # Définitions Apollo (queries & mutations)
│   │       │   ├── book/                 # book.ts, book-search.ts, book-review.ts, book-review-vote.ts, book-recommendation.ts
│   │       │   ├── author/
│   │       │   ├── user/                 # auth.ts (WHOAMI, LOGIN, REGISTER, LOGOUT), userBook.ts, profile.ts
│   │       │   ├── category/
│   │       │   ├── admin/                # stats, activité, listes paginées, mutations de suppression
│   │       │   └── banner/               # bannières de site (CRUD admin + bannière active publique)
│   │       ├── contexts/
│   │       │   ├── AuthContext.ts        # Type AuthContextType
│   │       │   └── AuthContextProvider.tsx  # Provider avec query WHOAMI + mutation LOGOUT
│   │       ├── config/
│   │       │   ├── client.tsx            # Apollo Client (cache-and-network hybride, credentials: include)
│   │       │   ├── config.ts             # Endpoint GraphQL (/api)
│   │       │   └── router.tsx            # React Router v7 avec lazy loading + guards
│   │       ├── constants/
│   │       │   └── bookStatus.ts         # Mapping statuts de lecture (icônes + classes des tokens status-*)
│   │       ├── types/                    # Un fichier par domaine, re-exportés par types.ts
│   │       │   ├── types.ts              # Barrel : export * de chaque domaine
│   │       │   └── user.ts, book.ts, author.ts, admin.ts, banner.ts, feed.ts, ui.ts…
│   │       ├── lib/                      # Logique pure (couverte par Vitest)
│   │       │   ├── utils.ts              # cn(), slugify(), hasIncompleteBookInfo(), hasIncompleteInfo(), getRatingClasses(), aria labels
│   │       │   ├── filterMaps.ts         # Mappings format/langue/statut/pays pour filtres
│   │       │   ├── profileActivity.ts    # computeStats(), describeAction(), timeBucket(), formatRelativeDate()
│   │       │   ├── password.ts           # Règles de robustesse (miroir de utils/password-policy.ts backend)
│   │       │   ├── banner.ts             # Variantes de bannière + blankDraft() de l'éditeur admin
│   │       │   ├── image.ts              # fileToDataUrl(), MAX_IMAGE_BYTES
│   │       │   ├── spoiler.ts            # parseSpoilers(), wrapSpoiler() : balises ||…|| (rendu : sections/shared/spoiler/)
│   │       │   └── downloadJson.ts       # Téléchargement de l'export RGPD
│   │       ├── styles/
│   │       │   ├── index.css             # Point d'entrée : imports seuls, dans l'ordre de la cascade
│   │       │   ├── tokens.css            # @theme static : typo, tracking, ombres, couleurs (surfaces, états, statuts)
│   │       │   ├── base.css              # html/body, scrollbar, focus clavier de repli
│   │       │   ├── utilities.css         # @utility maison : filet, grain, no-scrollbar, ornements typographiques
│   │       │   ├── motion.css            # Modales, fade-up, spinner
│   │       │   ├── ornaments.css         # Animations décoratives (chandelle, sceau, podium…) + mouvement réduit
│   │       │   ├── toast.css             # Sonner habillé par les tokens d'état
│   │       │   ├── fonts.css             # Polices auto-hébergées
│   │       │   └── loader-nocturne.css   # Loaders (importé par NocturneLoader)
│   │       └── data/                     # Données statiques
│   │
│   └── backend/                          # Apollo Server 5 + TypeGraphQL + TypeORM
│       └── src/
│           ├── server.ts                 # Initialisation (BDD → admin → titres → schema → serveur)
│           ├── types/
│           │   └── types.ts              # Enums et types partagés backend (UserRole, UserActionType, Context)
│           ├── database/
│           │   ├── config/datasource.ts  # Configuration TypeORM DataSource (PostgreSQL)
│           │   ├── entities/             # Entités TypeORM + TypeGraphQL (14 entités)
│           │   │   ├── user/             # User, UserBook, UserActions, UserFollow
│           │   │   ├── book/             # Book, BookReview, BookReviewComment, BookReviewVote, BookRecommendation
│           │   │   ├── author/           # Author
│           │   │   ├── category/         # Category
│           │   │   ├── banner/           # SiteBanner
│           │   │   └── gamification/     # Title, ReadingGoal (défi annuel)
│           │   ├── filteredResults/      # Types TypeGraphQL pour pagination (BooksResult, etc.)
│           │   └── migrations/           # Migrations TypeORM (jouées au boot)
│           ├── graphql/
│           │   ├── resolvers/            # 21 resolvers TypeGraphQL
│           │   │   ├── user/             # AuthResolver, UserBooksResolver, ProfileResolver, UserActionsResolver, FeedResolver, FollowResolver, PrivacyResolver (RGPD)
│           │   │   ├── book/             # BooksResolver, BookReviewsResolver, BookReviewCommentsResolver, BookReviewVotesResolver, BookRecommendationsResolver, BookSearchResolver
│           │   │   ├── author/           # AuthorsResolver
│           │   │   ├── category/         # CategoryResolver
│           │   │   ├── admin/            # AdminResolver (adminStats, recentActivity, listes/suppressions)
│           │   │   ├── banner/           # SiteBannersResolver (CRUD admin + activeSiteBanner public)
│           │   │   ├── stats/            # StatsResolver (compteurs publics du site)
│           │   │   └── gamification/     # TitleResolver, LeaderboardResolver (classement SQL : mois / depuis toujours), ReadingGoalResolver (défi annuel)
│           │   ├── dataloaders/          # DataLoaders par requête (compteurs, follows, titres)
│           │   ├── inputs/               # Input types TypeGraphQL (create/, update/)
│           │   └── queries/              # Types d'entrée pour les queries de recherche
│           ├── services/                 # Logique métier
│           │   ├── auth-service.ts       # Register, login, whoami (Argon2 + JWT)
│           │   ├── grind/
│           │   │   ├── grant-xp-service.ts  # Attribution XP et calcul de niveau
│           │   │   ├── total-xp.ts          # XP cumulée depuis le niveau (classement)
│           │   │   └── user-xp-service.ts   # Mapping XP → niveau
│           │   ├── gamification/
│           │   │   └── reading-goal-service.ts  # Défi annuel : comptage, XP à l'atteinte
│           │   ├── rgpd/
│           │   │   ├── export-service.ts      # Portabilité : export JSON des données
│           │   │   └── erasure-service.ts     # Effacement du compte (transaction)
│           │   ├── cloudinary.service.ts # Upload images (avatar, bannière, couverture)
│           │   └── books/
│           │       ├── google-books.service.ts    # Intégration API Google Books
│           │       └── open-library.service.ts    # Intégration API Open Library
│           ├── middlewares/
│           │   ├── auth-checker.ts       # AuthChecker TypeGraphQL (JWT via cookie)
│           │   ├── rate-limiter.ts       # Fenêtre fixe en mémoire (login, register, googleAuth, importBook)
│           │   ├── error-handler.ts      # Classe AppError (message + statusCode)
│           │   ├── format-error.ts       # formatError Apollo : code déduit du statut, erreurs inconnues masquées en prod
│           │   └── query-limits.ts       # Règle de validation : profondeur et largeur maximales des requêtes
│           ├── utils/
│           │   ├── author-factory.ts     # getOrCreateAuthorByFullName()
│           │   ├── authorizations.ts     # isOwnerOrAdmin()
│           │   ├── banner-visibility.ts  # isBannerVisibleTo() (audience d'une bannière)
│           │   ├── password-policy.ts    # Règles de mot de passe partagées inscription/changement
│           │   ├── paris-date.ts         # parisToday(), parisYear() : dates de lecture et défi à l'heure de Paris
│           │   ├── xp-keys.ts            # Clés de déduplication de l'XP (book, isbn13, author, helpfulVote, readingGoal)
│           │   └── actionsXpMap.ts       # Table XP par action (BOOK_ADDED: 50, REVIEW_CREATED: 100, etc.)
│           ├── test/
│           │   └── factories.ts          # makeUser(), makeContext(), stubPersistence() pour les tests Jest
│           └── scripts/
│               ├── create-admin.ts       # Seeding de l'utilisateur admin
│               └── seed-titles.ts        # Seeding des titres/badges de gamification
│
├── .github/workflows/ci.yml              # CI : lint, tests, build/typecheck sur test et main
├── docs/superpowers/
│   ├── specs/                            # Design specs (sidebar, recherche hybride, bannière, admin, etc.)
│   └── plans/                            # Plans d'implémentation
├── compose.yaml                          # Docker Compose (front, back, PostgreSQL 15)
└── pnpm-workspace.yaml                   # Workspace pnpm (app/frontend, app/backend)
```

## Key Patterns

### Styling

- **Tailwind CSS 4** via PostCSS (`@tailwindcss/postcss`)
- **Design tokens** dans `src/styles/tokens.css` (`@theme static`, toutes les variables émises car certaines sont lues en `var()` depuis du TS). Toute couleur d'interface passe par un token ; seules les illustrations (loaders, sceaux, couvertures factices, dégradés d'ornement) gardent des `hsl(...)` propres. Une valeur arbitraire qui vaut un token s'écrit avec le token (`bg-[hsl(43_59%_81%/0.45)]` → `bg-primary/45`).
- **Tokens d'état** (`info`, `success`, `warning`, `error`, `reward` pour l'or des récompenses) : tout ce qui informe (bannière, toast, badge, message de formulaire) les utilise. Cinq rôles par état : `<état>` (texte, icône, aplat, ≥ 4,5:1 sur `background` et `card`), `<état>-foreground` (texte sur l'aplat), `<état>-border`, `<état>-surface` (voile de l'effet verre : `linear-gradient(surface, surface), var(--color-card)`), `<état>-subtle` (fond de pastille). `destructive` reste l'aplat des boutons destructeurs ; un texte d'erreur s'écrit `text-error`, jamais `text-destructive` (3:1, illisible).
- **Statuts de lecture** : `status-<to-read|reading|read|paused|abandoned>` (+ `-border`, `-surface`, `-dot`), consommés par `constants/bookStatus.ts`.
- **Autres tokens** : `subtle-foreground` (légendes), `sunken` (creux sur carte, avec opacité), `scrim` (voile de modale), `ink` (pastille sur image, avec opacité), `hairline` (séparateur clair), `gold-muted` / `gold-bright`, `ember` (flamme des recommandations) ; ombres `shadow-{focus-halo,card-hover,modal,cover,lift,panel,glow-gold,glow-gold-soft}`, `inset-shadow-highlight` (se combine avec `shadow-*`), `text-shadow-legible`, anneau doré via `ring`/`inset-ring` + `ring-primary/N` ; tracking `tracking-{label,caps,spaced,ornament}` (0.14 / 0.2 / 0.26 / 0.32em) au lieu de `tracking-[…]`. Dégradés partagés en `@utility` (`cover-scrim`, `hero-halo`, `filet`, `grain`). Une nuance de gris ou d'or isolée s'obtient par opacité d'un token (`text-subtle-foreground/80`), pas par un nouveau `hsl`.
- **Page de contrôle** : `/dev/etats` (`pages/dev/DesignStates.tsx`, dev uniquement, retirée du build de prod) montre bannières, toasts, messages, pastilles et nuancier. Temporaire.
- **Toasts** : `useToast` (Sonner, `richColors`) ; leur habillage vit dans `styles/toast.css`, pas dans des classes `!important` au site d'appel.
- **`cn()`** depuis `@/lib/utils` (clsx + tailwind-merge) — utilisé dans chaque composant
- **CVA (class-variance-authority)** pour les variantes de composants UI (Button, inputs)
- **4 espaces** d'indentation — configuré dans Prettier (tabWidth: 4)

### Composants

- **Organisation par domaine** : `components/sections/<domaine>/` pour les composants fonctionnels
- **UI générique** : `components/UI/` pour les composants purement visuels réutilisables
- **Skeletons dédiés** : un squelette par page (`BookDetailsSkeleton`, `AuthorDetailsSkeleton`, etc.) utilisé dans les `<Suspense>`
- **Guards HOC** : `ProtectedRoute`, `PublicRoute`, `AdminRoute` dans `components/hoc/`
- **Aria labels** : générés via `buildBookAriaLabel()` et `buildAuthorAriaLabel()` depuis `@/lib/utils`

### State Management

- **Auth globale** : React Context (`AuthContext` + `AuthProvider`) — seul état global de l'application
- **État UI local** : `useState` / `useReducer` dans les composants
- **Cache serveur** : Apollo Client en mode hybride — `cache-and-network` (watchQuery) / `cache-first` (query) par défaut ; les vues à fraîcheur critique (whoami, bannières, favoris) conservent un `fetchPolicy: "network-only"` explicite dans leur hook
- **Persistance locale** : `useLocalStorage` pour l'état de la sidebar (collapsé/déployé)
- **Pattern hooks** : la logique de fetch est encapsulée dans des custom hooks par domaine (ex : `useBookData`, `useUserBooksData`)

### Routing

- **React Router v7** avec `createBrowserRouter`
- **Lazy loading** sur toutes les pages sauf `Books` (page d'accueil) — via `lazy()` + `<Suspense>`
- **Guards de route** : wrapping HOC dans la définition de route (`<ProtectedRoute>`, `<AdminRoute>`)
- **Slugs** : les livres et auteurs utilisent `/books/:slug` et `/authors/:slug` générés via `slugify()`
- **Route catch-all** : `path: "*"` lance une `Response` 404 vers `<ErrorElement>`
- **Profil** : `/profil` (connecté, profil propre) et `/profil/:id` (public, lecture seule)
- **Classement** : `/classement` (connecté), à côté du Fil dans la barre latérale
- **Livre preview** : `/books/preview/:isbn13` pour les livres importés non encore enregistrés

### API & Data Fetching

- **GraphQL via Apollo Client** (`@apollo/client`) — pas d'Axios, pas de REST
- **Endpoint unique** : `/api` proxifié vers le backend Docker (configuré dans `vite.config.ts`)
- **Credentials** : `credentials: "include"` pour les cookies HTTP-only
- **Queries** : politique hybride par défaut — `cache-and-network` (watchQuery) / `cache-first` (query) ; vues critiques (auth, bannières, favoris) avec `fetchPolicy: "network-only"` explicite
- **Mutations** : refetch manuel ou mise à jour du cache Apollo après mutation
- **FieldResolvers** backend : `averageRating`, `reviewCount`, `hasUserReviewed`, `isInLibrary`, `myReview`, `myUserBook` (entrée de bibliothèque du lecteur : statut et date, pour la fiche livre) calculés côté serveur dans `BooksResolver`
- **Recherche hybride** : `BookSearchResolver` interroge la BDD + Google Books + Open Library en parallèle

### Formulaires

- **React Hook Form** (`useForm`, `register`, `handleSubmit`, `formState`) pour tous les formulaires
- **Validation** : côté frontend (règles RHF) + côté backend (`class-validator` + TypeGraphQL)
- **Champs** : `<Input>` et `<Textarea>` (`components/UI/form/`) portent l'habillage atelier par défaut via `fieldVariants` (`UI/form/field.styles.ts`, CVA `kind` : input / textarea / inline, `state` : default / error / success). Ne pas recopier de classes de bordure ou de focus chez l'appelant : passer `state` (ou `errorMessage`, qui implique `error`). Pour un `<input>`/`<textarea>` natif, `cn(fieldVariants({...}), …)`. Selects : `selectTriggerClass`, erreur posée par `TypeSelect`.
- **Erreur** : bordure et halo rouges + message sous le champ (`FieldShell`, `Field` du profil) ; le texte saisi garde sa couleur.
- **Succès** : réservé aux vérifications que l'utilisateur ne peut pas faire seul (confirmation de mot de passe, clé ISBN-13 via `lib/isbn.ts`, URL complète via `lib/url.ts`) et aux champs corrigés après une erreur (`hooks/form/useRecovered`, automatique dans `TextField`/`TextareaField`). `success` : `true` pour la bordure seule, une chaîne pour un message. Jamais à la connexion (ne pas confirmer qu'un compte existe) ni sur un champ libre.

### Authentification

- **JWT en cookie HTTP-only** — stocké côté backend, jamais exposé au JS frontend
- **`WHOAMI` query** : appelée au mount de `AuthProvider` pour hydrater le contexte utilisateur
- **Utilisateur courant** : une seule source, `context.getUser()` (résolution du cookie JWT mémoïsée pour la requête, `utils/current-user.ts`). Dans un resolver : `requireUser(context)` (401 si visiteur) ou `getCurrentUser(context)` (null pour un visiteur, queries publiques). Ne jamais appeler `whoami()` directement. `customAuthChecker` (`@Authorized()`) lit le même `getUser()` et lève `AuthenticationError` sans session.
- **Visibilité des données** : règles centralisées dans `utils/visibility.ts`. L'activité est publique (fil des abonnements, fil global, activité d'un profil), sauf les actions de bibliothèque (`BOOK_ADDED_TO_LIBRARY`, `BOOK_FINISHED`) d'un compte dont `User.isLibraryPublic` est faux (privé par défaut) : `onlyVisibleActions(qb, viewer, …)` les retire à la lecture. La bibliothèque d'un autre se lit via `userBooks(userId)` / `userBookStatusCounts(userId)`, autorisée par `canViewLibrary` (propriétaire, admin, ou partage actif). Les favoris restent publics. Aucune relation d'entité n'est exposée en `@Field` par défaut : exposer une donnée d'un autre utilisateur passe par un FieldResolver ou une query qui applique ces règles.
- **Rôles** : `@Authorized()` = toute session (user, moderator, admin) ; `@Authorized(Roles.Admin)` = admin. Ne pas écrire `@Authorized(Roles.User, Roles.Admin)`, qui exclut les modérateurs.
- **Erreurs** : les resolvers lèvent des `AppError(message, statusCode)` sans `try/catch` d'enrobage ; `middlewares/format-error.ts` déduit `extensions.code` du statut (`NOT_FOUND`, `FORBIDDEN`, `UNAUTHENTICATED`, `BAD_USER_INPUT`, `CONFLICT`, `TOO_MANY_REQUESTS`), n'envoie jamais `additionalInfo`, traite un UUID mal formé (22P02) en `NOT_FOUND` et masque toute autre erreur en prod. Côté front, détecter par code (`lib/graphqlErrors.ts` : `isNotFoundError`, `hasGraphQLErrorCode`) plutôt que par message ; les toasts de `utils/graphql-error.ts` matchent encore des messages, à ne pas renommer à la légère.
- **Sessions révocables** : le JWT porte `v` = `User.tokenVersion` (non exposé), comparé par `whoami`. Incrémenter `tokenVersion` révoque toutes les sessions ; `changePassword` le fait et réémet le cookie de la session en cours. Un jeton sans `v` vaut 0.
- **Limites de requête** : `middlewares/query-limits.ts` (`QUERY_LIMITS` : 8 niveaux, 400 champs, alias et fragments compris) branché en `validationRules`. Une nouvelle requête front plus profonde que 8 niveaux sera refusée : ajuster la limite plutôt que la contourner.
- **Validation des entrées** : helpers dans `graphql/helpers/validation.ts` — `SkipIfEmpty()` pour un champ optionnel où `""` vaut « non renseigné » (ne pas écrire de `ValidateIf` à la main), `EXTERNAL_URL_OPTIONS` pour tout `@IsUrl` rendu en `href` (http(s) obligatoire), `isInternalPath`. ISBN-13 : `utils/isbn.ts` (`normalizeIsbn13`, `ISBN13_PATTERN`) avant tout appel externe ou enregistrement. Toute chaîne d'input ou d'argument a une longueur maximale.
- **Google OAuth** : `@react-oauth/google` intégré (nécessite configuration `VITE_GOOGLE_CLIENT_ID` si activé)
- **Logout** : mutation GraphQL `LOGOUT` + `setUser(null)` + `refetch()` du WHOAMI

### Gamification

- **XP par action** (défini dans `actionsXpMap.ts`) :
  - Livre ajouté : 50 XP | Auteur ajouté : 30 XP
  - Livre terminé : 70 XP | Critique rédigée : 100 XP (+50 si détaillée)
  - Livre importé : 30 XP | Complété (livre/auteur) : 50 XP
  - Défi de lecture atteint : 10 XP par livre visé, plafonné à 500 (montant variable passé en `xp` à `grantXpService`, une fois par année)
- **Niveaux** : calculés depuis le total XP via `user-xp-service.ts`. `User.xp` est l'XP **du niveau en cours** ; l'XP cumulée se déduit par `totalXp(level, xp)` (`grind/total-xp.ts`, `TOTAL_XP_SQL` en SQL)
- **Titres/Badges** : seedés en BDD via `seed-titles.ts`, débloqués selon le niveau
- **Défi de lecture annuel** (`ReadingGoal`, un par lecteur et par année de Paris) : la progression compte les `UserBook` « lus » dont `finishedAt` tombe dans l'année, calculée à la lecture. Tout passage en « Lu » (ajout ou changement de statut) sans date fournie pose `finishedAt` au jour (Paris) ; le champ « Lu le » (bibliothèque, fiche livre) corrige la date d'une lecture ancienne. `checkReadingGoal` est appelé après chaque passage en lu ou datation. Visible des autres comme la bibliothèque (`canViewLibrary`) ; `READING_GOAL_REACHED` est une action de bibliothèque.
- **Dates de lecture** : `startedAt` / `finishedAt` sont des colonnes `date`, exposées en `String` `YYYY-MM-DD` (TypeORM les lit en chaîne, que le scalaire `DateTimeISO` refuserait). Pas de date de fin dans le futur.
- **Traçabilité** : entité `UserActions` — log de chaque action XP avec timestamp
- **XP une seule fois par cible** : `grantXpService(user, type, { xpKey, … })` n'accorde rien si le triplet `(user, type, xpKey)` existe déjà en `user_actions` (colonne `xpKey` + index unique partiel, migration `1785000000000`). La déduplication est **par cible, pas globale** : recommander le livre A, retirer puis remettre la recommandation ne redonne pas d'XP, mais recommander le livre B en donne. Le service renvoie un booléen (`true` = XP accordée).
  - Clés construites via `utils/xp-keys.ts` — `book(bookId)` (ajout en bibliothèque, livre terminé, critique + bonus détaillé, recommandation, complétion de fiche), `isbn13(isbn)` (livre créé ou importé), `author(authorId)` (complétion de fiche auteur), `helpfulVote(reviewId, voterId)` (vote utile : l'XP va à l'auteur de la critique, une fois par votant).
  - Toujours dériver la clé d'un identifiant **stable** (le livre, l'ISBN, l'auteur), jamais de l'id d'une entité supprimable et recréable (`UserBook`, `BookReview`, `BookRecommendation`, `BookReviewVote`) — sinon annuler puis refaire l'action redonne de l'XP.
  - `targetId` et `metadata` gardent leur rôle d'affichage (fil d'activité, liens `feedTargetHref`) et sont indépendants de `xpKey`.
  - Les actions antérieures à la migration ont `xpKey = NULL` et ne dédupliquent rien : chaque cible déjà récompensée peut rapporter une dernière fois.

## Checklist : nouvel endpoint (resolver, query, mutation)

Chaque point renvoie à une primitive existante : l'utiliser plutôt que recoder la règle localement.

1. **Accès** : `@Authorized()` (toute session) ou `@Authorized(Roles.Admin)`. Sans décorateur uniquement si toutes les données renvoyées sont publiques.
2. **Utilisateur** : `requireUser(context)` ou `getCurrentUser(context)` (`utils/current-user.ts`). Jamais `whoami()` ni lecture directe du cookie.
3. **Propriété** : filtrer sur le propriétaire dans le `where` (`user: { id: user.id }`), un élément d'autrui renvoie alors NOT_FOUND. `isOwnerOrAdmin` seulement si l'admin doit pouvoir agir (voir `updateBook`).
4. **Visibilité** : toute donnée d'un autre utilisateur passe par `utils/visibility.ts` (étendre ce fichier, pas de règle ad hoc).
5. **Exposition** : pas de `@Field` sur une relation ni sur un champ privé (`hashedPassword`, `googleId`, `tokenVersion`, `xpKey`, `email` hors FieldResolver). Exposer via un FieldResolver qui applique la visibilité.
6. **Entrées** : InputType class-validator. Toute chaîne bornée (`Length` / `MaxLength`), optionnel vide → `SkipIfEmpty()`, URL → `@IsUrl(EXTERNAL_URL_OPTIONS)`, ISBN → `normalizeIsbn13`, enum → `@IsEnum`, id → `ID`.
7. **Listes** : étendre `PaginationInput` (ou `clampPagination` pour des arguments séparés). Aucune liste publique non bornée ; un besoin admin « tout charger » a sa propre query `admin*`.
8. **Coût** : appel externe, service payant ou action facile à spammer → `enforceRateLimit` (ou `tryRateLimit` pour dégrader) avec une règle dans `RATE_LIMIT_RULES`.
9. **Erreurs** : `throw new AppError(message, statut)`, sans `try/catch` d'enrobage ni détail technique dans le message. Le statut donne le code reçu par le front.
10. **XP** : `grantXpService` avec une clé stable de `utils/xp-keys.ts`.
11. **Schéma** : toute colonne passe par une migration (`synchronize: false`). Donnée personnelle → l'ajouter à l'export (`rgpd/export-service.ts`) et vérifier l'effacement (`rgpd/erasure-service.ts`).
12. **Tests** : un test d'autorisation par mutation sensible (visiteur, non-propriétaire, admin), avec `src/test/factories.ts`.
13. **Front** : erreurs détectées par code (`lib/graphqlErrors.ts`, règles de `utils/graphql-error.ts`) ; requête de 8 niveaux au plus (`QUERY_LIMITS`) ; toute nouvelle origine externe ajoutée à la CSP nginx.

## Convention de tests

Un test existe pour attraper un bug plausible, pas pour augmenter la couverture. Aucun test n'est écrit par réflexe.

**Critère d'entrée** : n'écrire un test que si au moins une condition est vraie.

1. **L'erreur coûte cher** : fuite de données, élévation de droits, XP accordée deux fois, effacement RGPD incomplet, session non révoquée.
2. **L'erreur serait silencieuse** : rien ne casse à l'écran (filtre propriétaire absent du `where`, borne décalée de un, fuseau horaire).
3. **La logique est non triviale** : branches, calculs, bornes, dates, mappings avec cas limites.
4. **C'est une régression déjà vécue** : un bug corrigé reçoit le test qui l'aurait attrapé.

**Test décisif** : si l'on casse le code de façon réaliste (inverser une condition, retirer un filtre, décaler une borne), le test doit échouer. Sinon il ne sert à rien et ne doit pas être écrit.

**Interdits** :

- Tester un libellé, un texte d'UI, une classe CSS, un snapshot de rendu.
- Tester qu'une constante vaut sa valeur (`expect(XP_MAP.BOOK_ADDED).toBe(50)`) : cela duplique le code au lieu de le vérifier.
- Tester le framework ou une bibliothèque (TypeORM sauvegarde, React rend, class-validator valide un `@IsEmail`).
- Tester un getter, un passe-plat, un composant sans logique.
- Recopier l'implémentation en mocks (« `save` a été appelé avec… ») sans vérifier un résultat observable.
- Multiplier les cas qui empruntent la même branche.

**Justification obligatoire** : chaque `describe` commence par une ligne qui nomme le risque couvert. Sans risque nommable, pas de test.

```ts
// Risque : un non-propriétaire modifie la critique d'un autre.
describe("updateReview", () => { ... });
```

**Forme** :

- Vérifier un comportement observable (valeur renvoyée, erreur et son code, état persisté), pas l'enchaînement des appels internes.
- Nommer le test d'après la règle métier (« refuse un visiteur », « n'accorde pas l'XP deux fois pour le même livre »), jamais « should work ».
- Mutation sensible : le trio visiteur / non-propriétaire / propriétaire ou admin, rien de plus si aucune autre branche ne change.
- Horloge figée, ni réseau ni BDD réelle (voir Gotcha « Tests »).

**Compte rendu** : en fin de tâche, lister chaque test ajouté avec le risque qu'il couvre.

## Gotchas

- **Proxy Vite → Docker** : le frontend appelle `/api` qui est proxifié vers `http://back:3310`. En dehors de Docker, ce proxy ne fonctionne pas — lancer via `docker compose up` obligatoirement.
- **fetchPolicy hybride** : l'Apollo Client utilise par défaut `cache-and-network` (watchQuery) / `cache-first` (query) pour une navigation instantanée. Les vues à fraîcheur critique conservent un `fetchPolicy: "network-only"` **explicite** au niveau du hook (whoami/`AuthContextProvider`, bannières `useSiteBanner`/`useSiteBanners`, favoris `FavoriteBookModal`). La fraîcheur post-mutation reste assurée par les `refetchQueries`.
- **Livres importés** : `isImported: true` signale un livre venant de Google Books / Open Library. `hasIncompleteBookInfo()` détecte les champs manquants (summary par défaut, pageCount = 0, catégorie "Autre", pas de couverture).
- **`slugify()`** est utilisé pour générer les URLs des livres et auteurs depuis leur titre/nom — s'assurer que les slugs sont bien formés avant navigation.
- **Package manager : pnpm uniquement** — workspace pnpm configuré dans `pnpm-workspace.yaml`.
- **Tests** — ciblés sur le sensible uniquement (auth, autorisations, XP, RGPD), pas de couverture exhaustive. Backend : Jest (`pnpm --filter backend test`) — services (`auth-service`, `grind/*`, `rgpd/*`), `auth-checker`, `format-error`, `utils/current-user`, `rate-limiter`, `utils/{authorizations,banner-visibility}` et resolvers de mutations (appel direct de la méthode avec `makeContext(user)` — qui fournit `getUser` — /`makeUser`/`stubPersistence` de `src/test/factories.ts`, statiques TypeORM mockés via `jest.spyOn`, pas de BDD). Frontend : **Vitest** (`pnpm --filter frontend test`, environnement `node`) sur la logique pure — `lib/{profileActivity,filterMaps,utils,password,graphqlErrors,spoiler,leaderboard,readingGoal,readingDate,isbn}`, `sections/feed/feedTargetHref`, validation de formulaires. Pas de tests de composants ni de hooks : il faudrait jsdom + Testing Library pour peu de valeur (la logique des hooks de liste tient dans les mappings de `filterMaps`, déjà couverts). Les tests de dates figent l'horloge (`vi.setSystemTime`). Jest tourne avec `maxWorkers: "25%"` (`jest.config.js`) : ts-jest type-checke dans chaque worker et la valeur par défaut sature la mémoire (workers tués par SIGKILL). Pour un simple contrôle de types côté backend, utiliser `pnpm --filter backend exec tsc --noEmit` (4 s) plutôt que `pnpm build`, qui compile vers `dist/` (`outDir` défini dans `tsconfig.json`).
- **Migrations TypeORM** : `datasource.ts` utilise `synchronize: false` ; les migrations sont jouées au boot, y compris en prod, sauf si `DB_MIGRATIONS_RUN="false"` (cf. `should-run-migrations.ts`). Les migrations sont dans `src/database/migrations/`. Le schéma initial est rejoué au boot après `docker compose down -v`. Logging SQL complet en dev, restreint à `error`/`warn` quand `NODE_ENV=production`.
- **Identifiants UUID** : toutes les entités utilisent une PK UUID (`@PrimaryGeneratedColumn("uuid")`, `gen_random_uuid()` natif PostgreSQL 15). Le scalaire GraphQL `ID` sérialise en string ; les ids sont des `string` côté back et front. Les URLs sont `/<uuid>-<slug>` et l'id est extrait via `slug.slice(0, 36)` (un UUID contient des tirets).
- **Admin & Profil implémentés et câblés** : `pages/Admin.tsx` (7 onglets — Dashboard, Utilisateurs, Livres, Auteurs, Catégories, Critiques, Bannières — + `AnalyticsBar`) et `pages/UserProfile.tsx` (hero éditable, stats, progression, favoris, activité) sont complets côté front ET backend. Backend : `AdminResolver` (`adminStats`, `recentActivity`, listes, suppressions), mutations de suppression réparties dans les resolvers de domaine (`deleteBook`/`deleteAuthor`/`updateCategory`/`deleteCategory`), `SiteBannersResolver` (CRUD + `activeSiteBanner`). Hooks front dans `hooks/admin/`. Les stats du profil sont calculées côté front via `lib/profileActivity` (`computeStats`) à partir des `UserActions`, pas via un FieldResolver.
- **Icônes** : migration vers `react-icons` terminée — `lucide-react` a été retiré des dépendances. Pour un équivalent lucide, utiliser le set `react-icons/lu` (préfixe `Lu`). Ne pas réintroduire `lucide-react`. Pour les glyphes animés/teintés sur mesure, primitif SVG inline `@/components/UI/Icon/Icon`.
- **Rate limiting** : un middleware (`middlewares/rate-limiter.ts`) existe ; le contexte expose l'IP client via `utils/client-ip.ts`, qui lit **uniquement** `X-Real-IP` (réécrit par le nginx du front grâce au module realip) et jamais `X-Forwarded-For`, falsifiable par le client. Le back n'étant joignable que par ce nginx en prod, l'en-tête est fiable. Si un CDN (Cloudflare…) est ajouté devant CapRover, déclarer ses plages dans `set_real_ip_from`. Couvert par `rate-limiter.test.ts` et `client-ip.test.ts`.
- **Politique de mot de passe** : définie une seule fois dans `utils/password-policy.ts` (8 à 255 caractères, majuscule, minuscule, chiffre, symbole) et appliquée à l'inscription (`CreateUserInput`) **et** au changement de mot de passe (`changePassword`). Miroir côté front dans `lib/password.ts` — le jeu de symboles est celui de `IsStrongPassword` (validator.js), une lettre accentuée n'en fait pas partie : garder les deux fichiers synchronisés.
- **Modification par l'admin** : `updateBook`/`updateAuthor` ne filtrent la recherche sur le propriétaire que pour les non-admins ; le contrôle `isOwnerOrAdmin` tranche ensuite. Ne pas remettre `user: { id: user.id }` inconditionnellement dans le `where`, cela rendrait le rôle admin inopérant.
- **Bonus critique détaillée** : `BookReviewsResolver` accorde `DETAILED_REVIEW_BONUS` (+50 XP) si `reviewText.length > 200`, une seule fois par livre (cf. `xpKey`).
- **Primitives partagées des pages détail** : après la refacto post-redesign (mergée), les pages livre/auteur s'appuient sur des composants mutualisés — `UI/Diamond`, `sections/shared/{CollectionSeam,SectionHairline,FicheManagementBar,Notice}` et `UI/EmptyStateCard`. Réutiliser ces primitives plutôt que recopier le markup. Les gros fichiers ont été éclatés en sous-composants frères (`profile/editProfile`, `profile/hero`, `library/favoriteBook`, `admin/{banners,categories,reviews,dashboard}`).
- **`reflect-metadata`** doit être importé avant TypeGraphQL/TypeORM dans `server.ts` — déjà en place, ne pas réorganiser les imports.
- **Decorators TypeScript** activés dans le backend (`experimentalDecorators: true`, `emitDecoratorMetadata: true`) — requis pour TypeORM et TypeGraphQL.
- **`schema.gql` auto-généré** : `emitSchemaFile: true` dans `buildSchema()` génère un fichier de schéma en développement — ne pas éditer manuellement.
- **Admin auto-créé** : `createAdmin()` est appelé au démarrage du serveur et crée l'admin si absent — configurer les variables `ADMIN_*` dans `.env`.
- **Cloudinary côté serveur uniquement** : tous les uploads (avatar, bannière, couvertures importées) passent par le backend avec les clés API (`cloudinary.service.ts`). Le front n'envoie que des data URI ; aucun preset non signé n'est utilisé.
- **Contrainte unique** `(user, book)` sur `BookReview` — une seule critique par utilisateur par livre, géré par contrainte BDD.
- **Prettier 4 espaces** : tabWidth: 4 avec `prettier-plugin-tailwindcss` pour le tri automatique des classes Tailwind.
- **`CONTEXT.md` (public)** : source de référence sur le « pourquoi » du projet, lue par une IA qui rédige des posts. Le mettre à jour lors de toute décision importante (nouvelle fonctionnalité, changement de schéma ou migration, bug marquant) : décision, intention, alternative écartée, effet ou coût, avec le commit ou le fichier de référence. Ne jamais y inventer d'intention : la demander à l'utilisateur, ou décrire la décision sans intention. Style sobre, sans tiret cadratin. Ne rien y écrire de secret, de personnel ni sur la situation professionnelle de l'auteur.

## Environment Variables

### Backend (`app/backend/.env`)

| Variable             | Rôle                                        |
| -------------------- | ------------------------------------------- |
| `APP_PORT`           | Port du serveur Apollo (3310)               |
| `DB_HOST`            | Hôte PostgreSQL (`db` dans Docker)          |
| `DB_PORT`            | Port PostgreSQL (5432)                      |
| `POSTGRES_DB`        | Nom de la base de données                   |
| `POSTGRES_USER`      | Utilisateur PostgreSQL                      |
| `POSTGRES_PASSWORD`  | Mot de passe PostgreSQL                     |
| `JWT_SECRET`         | Clé de signature des tokens JWT             |
| `COOKIE_SECRET`      | Clé de signature des cookies                |
| `ADMIN_EMAIL`        | Email de l'utilisateur admin initial        |
| `ADMIN_PASSWORD`     | Mot de passe de l'admin initial             |
| `ADMIN_NAME`         | Nom d'utilisateur de l'admin                |
| `ADMIN_ROLE`         | Rôle admin (`ADMIN`)                        |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary                  |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary                          |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary                   |
| `GOOGLE_CLIENT_ID` | Client ID OAuth Google (échange + audience)  |
| `GOOGLE_CLIENT_SECRET` | Client secret OAuth Google                   |

### Frontend (`app/frontend/.env`)

| Variable                       | Rôle                                        |
| ------------------------------ | ------------------------------------------- |
| `VITE_GOOGLE_CLIENT_ID`         | Client ID OAuth Google (public, GoogleOAuthProvider) |

## Deployment

- **Docker Compose** : stack 3 services — `front` (Node 24 Alpine, port 5173), `back` (Node 24 Alpine, port 3310), `db` (PostgreSQL 15, port 5433 exposé)
- **Réseau** : deux réseaux isolés — `frontend_network` (front ↔ back) et `backend_network` (back ↔ db)
- **Volumes** : `db_data` pour la persistance PostgreSQL ; montages de source pour le hot reload en dev
- **Health check** : la BDD doit passer `pg_isready` avant le démarrage du backend (`depends_on: condition: service_healthy`)
- **Hot reload** : frontend via Vite polling (`usePolling: true`) ; backend via `ts-node-dev`
- **Commande de démarrage** : `docker compose up --build` depuis la racine du projet
- **En-têtes nginx (prod)** : `app/frontend/nginx/default.conf.template` pose nosniff, Referrer-Policy, X-Frame-Options DENY, Permissions-Policy, HSTS et `server_tokens off`. La CSP est appliquée (`Content-Security-Policy`, après une phase Report-Only sans violation) : toute nouvelle origine externe (script, iframe, API appelée par le navigateur) doit y être ajoutée, sinon le navigateur la bloque. Les erreurs « Cross-Origin-Opener-Policy … window.closed » à la connexion Google viennent du script Google lui-même (popup protégée par COOP) et sont sans effet.
- **Production (CapRover)** : `Dockerfile.prod` par app (back : multi-stage, user non-root, `node dist/server.js` ; front : build Vite servi par nginx qui proxifie `/api` vers le back en même origine) et un `captain-definition` dans `app/backend` et `app/frontend`. Déploiement via `pnpm deploy:all` (ou `deploy:back` / `deploy:front` ; jamais `pnpm deploy`, commande intégrée de pnpm qui masque le script) depuis `origin/test`, récupéré juste avant (jamais des commits locaux non poussés : pousser et attendre la CI d'abord) : `scripts/caprover-archive.sh` construit l'archive (dossier de l'app + `_workspace/` avec `pnpm-lock.yaml` et les manifestes du workspace) puis `caprover deploy -t`. Les `Dockerfile.prod` installent en `--frozen-lockfile` et ne se construisent qu'à partir de cette archive. Voir `docs/deployment-caprover.md` et `docs/caprover-setup.md`. Aucun secret dans le repo, les variables sont saisies dans CapRover.
- **CI GitHub Actions** (`.github/workflows/ci.yml`) : sur push vers `test`/`main` et sur PR ciblant ces branches — job frontend (lint, Vitest, `pnpm build`) et job backend (lint, `tsc --noEmit`, Jest), Node 24 comme les images Docker. Étapes ordonnées du moins cher au plus cher pour échouer au plus tôt ; le build du front couvre le typecheck (`tsc -b`) et le bundle Vite. Jeton en lecture seule et `timeout-minutes: 10` par job. Pas de hooks git locaux (husky) : la CI fait foi. Lint strict (`--max-warnings 0`) : un warning fait échouer la CI.
- **Protection de `main`** (ruleset GitHub) : suppression et force push interdits, checks `Frontend (lint, typecheck, test)` et `Backend (lint, typecheck, test)` requis. Les checks sont liés au commit : pousser d'abord sur `test`, attendre la CI verte, puis pousser le **même** commit sur `main` — un commit non vérifié poussé directement sur `main` est refusé. Renommer un job dans `ci.yml` casse la règle (le check requis n'existe plus) : mettre le ruleset à jour en même temps.

## Code Style

- **ESLint** : `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`
- **Prettier** : 4 espaces, `prettier-plugin-tailwindcss` pour le tri des classes
- **TypeScript strict** : mode strict activé sur frontend et backend, `noUnusedLocals`, `noUnusedParameters`
- **Alias** : `@/*` → `src/*` (frontend uniquement, configuré dans `vite.config.ts` et `tsconfig.json`)
- **Formatage** : défauts Prettier (points-virgules, guillemets doubles) + `tabWidth: 4`, config unique `.prettierrc` à la racine. `pnpm format` / `pnpm format:check` depuis la racine (portée `app/*/src`), vérifié en CI. Le reformatage initial est listé dans `.git-blame-ignore-revs` (`git config blame.ignoreRevsFile .git-blame-ignore-revs`).
- **Module CommonJS** côté backend, **ESM** côté frontend (`"type": "module"`)
