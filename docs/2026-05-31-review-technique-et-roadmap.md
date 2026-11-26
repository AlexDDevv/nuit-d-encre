# Review technique & roadmap — Nuit d'Encre

> Revue initiale du 2026-05-31, **actualisée le 2026-11-26** (audit de sécurité terminé et en prod).
> La première partie fait l'état des lieux, la seconde fixe la suite.

## État au 2026-11-25

Le MVP est complet et déployable. Le projet avait été considéré comme terminé en juillet
2026, puis il a été repris en novembre 2026 pour être poursuivi sur du temps libre.

### Ce qui a été livré depuis la review initiale

| Phase | Contenu | État |
|-------|---------|------|
| 0 — Filet de sécurité | Migrations TypeORM, transactions XP, race condition auteur, Jest + Vitest, CI GitHub Actions, rate limiting, codes d'erreur `AppError` | ✅ 2026-06-10 |
| 1 — Pages manquantes | Profil (privé + public) et panel Admin (7 onglets + analytics), bannières de site | ✅ 2026-06-19 |
| 2 — Qualité / perf | DataLoaders, fetchPolicy hybride, `author.books` borné, `React.memo`, mutations typées, Error Boundary, barre XP animée | ✅ 2026-06-19 (leaderboard et logger non faits) |
| Redesign | Fiches « atelier du scribe », auth, erreurs, légal, boutons, loaders, Contact, `siteStats`, typo Tailwind, refacto post-redesign | ✅ 2026-06-24 |
| 3 — Social MVP | `UserLink`, follow (`UserFollow`), fil d'activité (`/fil`), **commentaires sur critiques** (`BookReviewComment`) | ✅ 2026-07 |
| Auth Google | `googleAuth` (échange de code + vérification de l'ID token), liaison de compte, rate limit dédié | ✅ 2026-07 |
| RGPD | Export JSON, suppression de compte (anonymisation en transaction), consentement explicite, script Google limité aux pages d'auth, polices auto-hébergées | ✅ 2026-07 |
| XP | Déduplication par cible (`xpKey` + index unique partiel) | ✅ |
| 4 — Prod | `Dockerfile.prod` multi-stage non-root (back) et nginx same-origin (front), `captain-definition`, migrations au boot (`DB_MIGRATIONS_RUN`), logging SQL restreint en prod, doc CapRover | ✅ en grande partie |
| Responsive | Pages publiques, admin, profil, formulaires, preview, modales (animations CSS) | ✅ en grande partie |
| Seed de démo | `pnpm seed:db` couvre tous les cas de l'app (follows, commentaires…) | ✅ |
| Audit de sécurité | Lots 1 à 6 : IP client, pagination bornée, Apollo 5, `requireUser`, `formatError`, visibilité (`isLibraryPublic`), sessions révocables, validation, limites de requête, CSP appliquée, checklist endpoints | ✅ 2026-11-25, en prod |

### Dette encore ouverte

- [ ] **Purge RGPD** : les durées de conservation sont annoncées dans les mentions légales,
      mais aucune purge automatique n'existe. Report fixé au 2026-09-20, date dépassée.
- [x] **Dépendances** (`joi`, Apollo Server 5, lockfile des Dockerfiles) : lot 2 de l'audit.
      Restent 10 avis `pnpm audit` jugés non exploitables, soldés par les montées ci-dessous.
- [ ] Passer **`type-graphql`** en stable (toujours `2.0.0-rc.3`), puis TypeORM 1.x et
      graphql 17 (montées majeures, chantier séparé).
- [ ] Pistes laissées par l'audit : mutation « se déconnecter partout » (`tokenVersion`),
      pagination serveur de `getUsers` / `adminReviews`.
- [ ] **Logger structuré** (Pino) à la place des `console.*`.
- [ ] **Sentry** (front + back) et health check HTTP propre.
- [ ] Reliquats responsive : autres pages connectées.

### État des fonctionnalités

| Domaine | Score | Notes |
|---------|-------|-------|
| Core (livres/auteurs) | 9/10 | Solide |
| Recherche & import hybride | 9/10 | BDD d'abord, puis Google Books + Open Library |
| Critiques, votes, commentaires | 9/10 | Balises spoiler `||…||` |
| Bibliothèque perso | 6/10 | 5 statuts (dont « abandonné »), une seule lecture par livre, pas de progression, pas de listes |
| Gamification | 8/10 | XP/niveaux/titres + barre XP + classement mensuel ; pas de défis ni de succès |
| Social | 6/10 | Follow, fil, commentaires ; pas de notifications ni de modération |
| Découverte | 4/10 | Pas de recommandations personnalisées, pas de citations ni de listes |
| Admin | 8/10 | Complet |
| Notifications | 0/10 | Absent |

---

## Benchmark : ce que font les autres applications

Repères tirés de Babelio, Goodreads, StoryGraph, Hardcover, Gleeph et Booknode.

| Fonctionnalité | Chez qui | État chez nous |
|---|---|---|
| **Citations** d'un livre, avec likes | Babelio (fonctionnalité phare) | absent |
| **Progression de lecture** (page / %) et notes de lecture | StoryGraph, Hardcover, Goodreads | `UserBook` n'a que `startedAt` / `finishedAt` |
| **Statut « abandonné » (DNF)** et **relectures** | StoryGraph, Hardcover | DNF fait ; une lecture par livre |
| **Défi de lecture annuel** | Goodreads, StoryGraph | absent |
| **Bilan annuel / statistiques** (pages, genres, rythme) | StoryGraph, Hardcover | stats de profil, pas de bilan |
| **Listes / étagères perso** publiques | Babelio, Hardcover | absent |
| **Balises spoiler** dans les critiques | tous | fait |
| **Humeur et rythme** d'un livre | StoryGraph | absent |
| **Import CSV** Goodreads / Babelio | StoryGraph, Hardcover | absent |
| **Scan du code-barres ISBN** | Gleeph, Hardcover | recherche ISBN présente, pas de caméra |
| **Lectures communes / clubs** | Babelio, Gleeph | absent |
| **Notifications** | tous | absent |

---

## Roadmap

### Palier 0 — Audit de sécurité (préalable)

- [x] Lots 1 à 6 de l'audit (`docs/audits/2026-11-25-audit-securite.md`, document local),
      terminés le 2026-11-25 et déployés.
- Conséquence : tout nouvel endpoint de la roadmap suit la **checklist de `CLAUDE.md`**
  (`requireUser`, `PaginationInput`, `utils/visibility.ts`, `@Field` uniquement sur le public,
  rate limit des appels externes, test d'autorisation).

### Palier 1 — Gains rapides (un week-end chacun)

- [x] **Statut DNF (« abandonné »)** (✅ 2026-11-26, sans action dans le fil, visible seulement dans la bibliothèque) : nouvelle valeur `ABANDONED` dans `ReadingStatus`,
      exclue des stats de livres lus et sans XP de lecture terminée. Visibilité dans le fil :
      action de bibliothèque, donc masquée par `onlyVisibleActions` si `isLibraryPublic` est faux.
- [x] **Balises spoiler** dans les critiques et commentaires (syntaxe `||texte||`, rendu
      flouté au clic, bouton « Spoiler » sous le champ) (✅ 2026-11-26).
- [x] **Leaderboard** : page `/classement`, XP du mois (heure de Paris, remise à zéro
      mensuelle) ou depuis toujours, tous les lecteurs ou ses abonnements ; top 50, podium,
      rang du lecteur hors du top ; admin exclu (✅ 2026-11-26).
- [ ] **Défi de lecture annuel** : objectif sur `User` (ou entité `ReadingGoal` par année),
      jauge sur le profil, titre ou succès débloqué à l'atteinte.
- [ ] **Dette hors audit** : Pino, Sentry, purge RGPD, `type-graphql` stable (voir plus haut).

### Palier 2 — Le cœur lecteur

- [ ] **Progression et journal de lecture** : entité `ReadingSession` (page atteinte, date,
      note optionnelle). Ouvre les relectures (plusieurs lectures d'un même livre),
      alimente le fil d'activité et permet de l'XP de régularité. Visibilité : action de
      bibliothèque, soumise à `isLibraryPublic` (`canViewLibrary`, `onlyVisibleActions`).
- [ ] **Citations** : entité `Quote` (livre, texte, page, auteur de la saisie), likes,
      onglet sur la fiche livre et sur le profil.
- [ ] **Listes perso** publiques ou privées (« Mes polars nordiques »), partageables.

### Palier 3 — Rétention et social

- [ ] **Notifications in-app** : nouveau follower, commentaire sur une critique, vote utile.
      Polling d'abord, subscription GraphQL ensuite.
- [ ] **Bilan de l'année** façon « Wrapped » : graphiques et page partageable.
- [ ] **Recommandations « pour toi »** : SQL sur catégories et auteurs lus, plus « les
      lecteurs que tu suis ont aimé ».
- [ ] **Modération et signalement** : entité `Report` + onglet admin.

### Palier 4 — Gros chantiers

- [ ] **Import CSV** Goodreads / Babelio, avec correspondance des ISBN via la recherche
      hybride.
- [ ] **PWA + scan de code-barres** ISBN par la caméra.
- [ ] **Lectures communes** : groupe autour d'un livre, jalons par chapitre, discussion
      protégée des spoilers.

### Ordre recommandé

0. ~~Terminer l'audit de sécurité~~ : fait le 2026-11-25.
1. **Progression de lecture** puis **citations** : ce sont les raisons de revenir sur
   l'application au quotidien, et le fil, les notifications et le bilan s'appuient dessus.
2. Le **défi annuel** si l'objectif est un effet visible rapide (meilleur rapport
   visibilité / effort).
3. Les notifications une fois qu'il y a assez d'événements à notifier.

---

## Annexe — Historique des décisions

- **2026-05-31** : ordre validé « finir Admin + Profil → améliorations → social ».
- **2026-06-26** : re-priorisation, sprint Social MVP (profils accessibles, follow, fil)
  avant le production-grade. Pas d'annuaire ni de recherche d'utilisateurs : la découverte
  passe par les critiques et le flux global.
- **2026-07** : commentaires sur critiques, auth Google, RGPD, mise en production CapRover.
  Projet considéré comme terminé.
- **2026-11-25** : reprise du projet, nouvelle roadmap ci-dessus. Audit de sécurité lancé
  (`docs/audits/2026-11-25-audit-securite.md`), il passe avant la roadmap fonctionnelle.
- **2026-11-26** : audit terminé (lots 1 à 6) et en prod, la roadmap fonctionnelle démarre.

Specs et plans détaillés : `docs/superpowers/specs/` et `docs/superpowers/plans/`.
