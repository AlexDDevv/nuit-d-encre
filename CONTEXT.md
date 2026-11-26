# Nuit d'Encre : contexte du projet

Document de référence sur le « pourquoi » du projet : intentions, décisions, difficultés et limites. Le code et le README décrivent le « quoi ».

## En une phrase

Une bibliothèque en ligne sociale et gamifiée : chaque lecteur y tient sa bibliothèque, écrit des critiques, recommande des livres, suit d'autres lecteurs et gagne de l'XP en enrichissant un catalogue commun.

## Déclencheur

- Goût personnel pour la lecture.
- Envie d'un projet personnel de grande taille, pensé comme un produit viable de bout en bout : infrastructure, sécurité, conformité, rétention des utilisateurs.
- C'est un projet de démonstration, pas un service destiné à un vrai public. Il est pourtant construit avec les exigences d'une mise en production (RGPD, CI, déploiement).

## Décisions produit

### La gamification sert à construire le catalogue

- Décision : l'XP récompense l'enrichissement du catalogue autant que la lecture. Ajouter un livre (50 XP), un auteur (30), importer un livre (30), compléter une fiche incomplète (50).
- Intention : pousser les utilisateurs à saisir leurs lectures en cours et passées, pour que le catalogue grandisse avec l'usage au lieu d'être rempli à la main par l'auteur du projet, ce qui aurait pris un temps considérable.
- Effet : les livres importés depuis une source externe arrivent volontairement incomplets (résumé par défaut, catégorie « Autre », 0 page). Ils sont signalés comme tels, et les compléter rapporte de l'XP.

### Un bonus pour les critiques développées

- Décision : +50 XP de bonus pour une critique de plus de 200 caractères, en plus des 100 XP de la critique (`book-review-resolver.ts`).
- Intention : encourager des critiques réfléchies et argumentées plutôt qu'un simple « bon livre ».

### L'XP ne se perd jamais

- Décision : une action annulée (retirer un livre, une recommandation, un vote) ne retire pas l'XP gagnée.
- Intention : perdre de l'XP, voire un niveau, serait frustrant et difficile à comprendre pour l'utilisateur.
- Alternative écartée : retirer l'XP à l'annulation. Pas retenue pour la raison ci-dessus.
- Coût : il faut alors empêcher de gagner de l'XP en boucle en annulant puis refaisant la même action (voir Décisions techniques).

### Effacement de compte : anonymiser plutôt que supprimer

- Décision : à la suppression d'un compte, les votes et le journal d'activité sont supprimés. Les critiques, recommandations et commentaires sont conservés sous « Lecteur supprimé ». Les livres et auteurs créés restent au catalogue.
- Intention : ne pas faire disparaître un contenu que la communauté a construit et que d'autres lecteurs ont lu, tout en respectant le droit à l'effacement.
- Contexte : chantier RGPD mené en vue de la mise en production, par exigence personnelle de conformité, même pour un projet de démonstration. Il comprend l'export des données en JSON, le consentement explicite à l'inscription et les mentions légales.

### Aucun tiers chargé sans nécessité

- Décision : les polices sont auto-hébergées au lieu d'être chargées depuis Google Fonts (`9f396c3`). Le script Google OAuth n'est chargé que sur les pages de connexion et d'inscription (`a43cf95`).
- Raison (messages de commit) : ces appels transmettaient l'adresse IP du visiteur à Google, ou pouvaient déposer des cookies, sans base légale claire. Cela contredisait la politique de confidentialité d'un site qui n'a aucun traceur par ailleurs.

### Un social volontairement limité

- Décision : suivre d'autres lecteurs, fil d'activité, commentaires sur les critiques. Pas d'annuaire ni de recherche d'utilisateurs : on découvre les autres lecteurs par leurs critiques, et le flux global s'affiche quand le fil est vide. Pas de notifications ni de modération.
- Intention : limiter le projet à un MVP complet plutôt que de pousser chaque domaine au maximum.

## Décisions techniques

### Déduplication de l'XP par cible

- Décision : chaque gain d'XP porte une clé (`xpKey`) construite à partir d'un identifiant stable (livre, ISBN, auteur, couple critique/votant). Un index unique partiel `(userId, type, xpKey)` empêche d'accorder deux fois le même gain.
- Intention : rendre sûre la règle « l'XP ne se perd jamais ».
- Détails : la clé ne dérive jamais d'une entité qu'on peut supprimer puis recréer (entrée de bibliothèque, critique, vote). En cas de requêtes concurrentes, l'index unique départage : la violation `23505` est traitée comme « déjà accordée ». L'attribution d'XP et son journal sont écrits dans la même transaction.
- Coût assumé : les actions antérieures à la migration n'ont pas de clé et peuvent rapporter une dernière fois.
- Référence : `d3aafae`, `services/grind/grant-xp-service.ts`, `utils/xp-keys.ts`, migration `1785000000000`.

### Recherche hybride : base locale d'abord

- Décision : la recherche interroge la base locale. Si elle renvoie moins de 5 résultats, Google Books et Open Library sont interrogés en parallèle (`Promise.allSettled`), puis les résultats sont dédupliqués par ISBN13.
- Intention : favoriser le catalogue interne et éviter les appels externes inutiles. Deux sources parce qu'il manque parfois à l'une des informations que l'autre fournit.
- Autre choix : un livre externe passe par une page de prévisualisation (`/books/preview/:isbn13`) avant d'être enregistré.
- Référence : `graphql/resolvers/book/book-search-resolver.ts`.

### Calculs côté serveur et DataLoaders

- Décision : les valeurs dérivées (note moyenne, nombre de critiques, présence en bibliothèque, compteurs d'abonnés, titre) sont des FieldResolvers calculés côté serveur. Chacun est regroupé par un DataLoader créé à chaque requête, pour éviter les requêtes N+1 sur les listes.
- Référence : `graphql/dataloaders/`, `00c2944`, `17f0c18`, `f927404`, `fc8bfce`.

### Effacement RGPD en une seule transaction

- Décision : `eraseUserAccount` supprime, anonymise (clé étrangère mise à NULL) et détache les contributions dans une seule transaction. La suppression d'un compte par l'admin passe par la même fonction.
- Référence : `services/rgpd/erasure-service.ts`, `c7665f0`, `97a9bcd`.

### Le fil d'activité réutilise le journal d'XP

- Décision : le fil est construit sur `UserActions`, la table qui journalise déjà chaque gain d'XP. Aucune nouvelle source d'événements n'a été créée.
- Référence : `9d38881`, `graphql/resolvers/user/feed-resolver.ts`.

### Des tests ciblés sur le risque

- Décision : pas d'objectif de couverture. Les tests portent sur ce qui coûte cher en cas de bug (authentification, autorisations, XP, RGPD, logique d'affichage dérivée). La logique pure du front est isolée dans `lib/` pour être testée sans navigateur simulé. Côté back, les accès TypeORM sont simulés, sans base de données.
- Alternative écartée : tests de composants avec jsdom et Testing Library, jugés peu utiles pour leur coût.
- Complément : CI stricte (un avertissement de lint fait échouer le build), branche `main` protégée, un commit n'y arrive qu'après une CI verte sur `test`.
- Référence : `.github/workflows/ci.yml`, `src/test/factories.ts` (back).

### Pagination plafonnée par une classe commune

- Décision : toute liste passe par `PaginationInput`, dont `limit` est borné à 100 (`utils/pagination.ts`). Les onglets admin qui lisaient tout le catalogue ont leurs propres queries réservées à l'admin (`adminBooks`, `adminAuthors`).
- Intention : un `limit` libre permettait de charger toute une table d'une seule requête. Mettre la borne dans une classe héritée fait de la sécurité le comportement par défaut des futures listes.
- Coût : le sélecteur de favoris cherche désormais côté serveur au lieu de filtrer localement une liste complète.
- Référence : `4e75b7e`, `f39a800`, `25ce7a7`.

### Builds de production figés par le lockfile

- Décision : l'archive envoyée à CapRover est construite par `scripts/caprover-archive.sh`, qui ajoute le `pnpm-lock.yaml` du monorepo au dossier de l'app. Les `Dockerfile.prod` installent en `--frozen-lockfile`.
- Intention : la prod reçoit exactement les versions vérifiées par la CI.
- Alternative écartée : un lockfile par application, qui aurait changé l'installation de tout le workspace et la CI.
- Coût : un `Dockerfile.prod` ne se construit plus qu'à partir de cette archive.
- Référence : `d7c4b06`.

### Une seule source pour l'utilisateur courant

- Décision : l'utilisateur de la session est résolu une fois par requête (`context.getUser()`, mémoïsé) et lu par `requireUser` / `getCurrentUser` dans les resolvers, par l'authChecker et par les DataLoaders (`utils/current-user.ts`).
- Intention : avant, trois mécanismes coexistaient ; le même champ se comportait différemment selon la query qui l'appelait. Une base fiable pour les futurs endpoints.
- Référence : `a6c89f7`.

### Codes d'erreur plutôt que messages

- Décision : le backend déduit `extensions.code` du statut de l'erreur et masque en production toute erreur inattendue (`middlewares/format-error.ts`). Le front détecte une ressource absente par ce code (`lib/graphqlErrors.ts`).
- Intention : ne plus lier le comportement du front au libellé d'un message, et ne plus exposer de message technique.
- Coût : les toasts de formulaire reconnaissent encore les erreurs par leur message.
- Référence : `f9232d0`, `2f22cfb`.

### Statut « abandonné », discret

- Décision : un livre peut être rangé en « Abandonné » dans la bibliothèque, à côté de « À lire », « En cours », « En pause » et « Lu ». Le statut ne rapporte pas d'XP et n'écrit aucune action : il n'apparaît ni dans le fil ni dans l'activité du profil, seulement dans la bibliothèque.
- Inspiration : le statut « DNF » (did not finish) de StoryGraph et Hardcover.
- Alternative écartée : un indicateur booléen à côté du statut, qui aurait permis des états contradictoires (« En cours » et abandonné à la fois).
- Effet : les « livres terminés » du profil, comptés depuis le journal d'actions, l'excluent sans autre changement ; passer un livre lu en abandonné ne retire pas l'XP déjà gagnée.
- Référence : `app/backend/src/database/migrations/1788000000000-AddAbandonedReadingStatus.ts`.

### Balises spoiler dans les critiques et commentaires

- Décision : un passage entouré de `||…||` est flouté à l'affichage et se dévoile au clic. Un bouton « Spoiler » sous le champ entoure la sélection, pour que la fonctionnalité soit trouvée sans connaître la syntaxe.
- Alternative écartée : la syntaxe seule, rappelée par une ligne d'aide, jugée trop peu découvrable.
- Effet : rien ne change côté serveur, le texte est stocké tel quel ; le découpage se fait côté front en éléments React, sans HTML injecté. L'admin voit le texte brut, marqueurs compris.
- Référence : `app/frontend/src/lib/spoiler.ts`.

### Un classement mensuel des lecteurs

- Décision : une page « Classement » ordonne les lecteurs par XP gagnée ce mois-ci (remise à zéro le 1er, à l'heure de Paris) ou depuis toujours, parmi tous les lecteurs ou parmi ses abonnements. Top 50 avec podium, et le rang du lecteur affiché même hors du top. L'admin n'est pas classé.
- Intention : donner envie de revenir, mettre les lecteurs en compétition et faire voir les lecteurs actifs.
- Alternatives écartées : un classement depuis toujours seul, figé au profit des premiers inscrits ; un classement hebdomadaire en plus, souvent presque vide avec peu de lecteurs.
- Effet : la décision de juin 2026 de ne pas lister les lecteurs (découverte par les critiques seulement) est abandonnée avec la reprise de la roadmap. Le classement est calculé à la lecture en SQL, sans colonne dénormalisée ; l'XP depuis toujours se déduit du niveau (`User.xp` ne garde que l'XP du niveau en cours).
- Référence : `app/backend/src/graphql/resolvers/gamification/leaderboard-resolver.ts`, `app/backend/src/services/grind/total-xp.ts`.

### Un défi de lecture annuel compté sur la date de fin

- Décision : chaque lecteur peut se fixer un nombre de livres à lire dans l'année (entité `ReadingGoal`). La jauge du profil compte les livres « lus » dont la date de fin tombe dans l'année. Passer un livre en « Lu » le date du jour ; un champ « Lu le » dans la bibliothèque corrige la date. Un livre ajouté directement comme lu reste sans date et ne compte pas tant qu'elle n'est pas renseignée. Atteindre l'objectif rapporte 10 XP par livre visé (plafond 500), une fois par année.
- Intention : un défi qu'on ne peut pas fausser sans le vouloir. Un nouvel inscrit qui saisit ses lectures passées ne doit pas compléter son défi en quelques minutes.
- Alternative écartée : compter les actions « livre terminé » de l'année, sans date de lecture. Plus simple, mais la saisie de lectures anciennes gonflait le compteur sans recours, et une relecture ne comptait jamais.
- Effet : le défi suit la visibilité de la bibliothèque (visible des autres seulement si elle est partagée). Au passage, `startedAt` / `finishedAt` sont exposés en chaînes `YYYY-MM-DD` : en `Date`, la moindre requête les demandant aurait échoué.
- Référence : `app/backend/src/services/gamification/reading-goal-service.ts`, migration `1789000000000-AddReadingGoal`.

### Activité publique, bibliothèque privée par défaut

- Décision : l'activité des lecteurs est publique (fil des abonnements, fil global pour découvrir d'autres lecteurs, activité du profil), mais la bibliothèque n'est montrée que si son propriétaire active « Partager ma bibliothèque ». Sans partage, les ajouts et lectures terminées disparaissent des fils et du profil ; critiques, recommandations et favoris restent visibles.
- Intention : un fonctionnement de réseau social où l'on découvre ce que lisent les autres, sans exposer une bibliothèque que personne n'a choisi de montrer.
- Alternative écartée : un réglage par livre (`UserBook.isPublic`), qui existait en base sans interface et n'était respecté nulle part.
- Effet : les comptes existants passent en privé ; la règle s'appliquant à la lecture, basculer le réglage cache ou réaffiche aussi l'activité passée.
- Référence : `937ffc9`, `f5291ba`, `4ed186f`.

### Sessions révocables par version de jeton

- Décision : le JWT contient une version de session (`User.tokenVersion`) comparée à chaque requête ; changer de mot de passe l'incrémente, ce qui déconnecte les autres appareils, et réémet le cookie de l'appareil en cours.
- Intention : un jeton volé ne doit pas rester valide après un changement de mot de passe.
- Alternative écartée : une liste noire de jetons, qui demande un stockage partagé pour une durée de vie de 24 h.
- Référence : `fe981ce`.

### Défenses en profondeur sur l'API

- Décision : profondeur et largeur des requêtes GraphQL bornées (8 niveaux, 400 champs), ISBN et URL validés avant usage, toute chaîne d'entrée plafonnée, en-têtes de sécurité nginx. La politique de sécurité du contenu (CSP) est d'abord en observation.
- Intention : refuser tôt les requêtes abusives et ne stocker que des données conformes.
- Coût : une CSP mal réglée casserait la connexion Google ou les couvertures ; elle n'est appliquée qu'après vérification.
- Référence : `682bdf0`, `31aef0a`, `75d548c`, `f574fb4`.

### Une checklist pour les futurs endpoints

- Décision : `CLAUDE.md` liste les points à respecter pour tout nouveau resolver (accès, utilisateur courant, propriété, visibilité, exposition des champs, validation, pagination, rate limiting, erreurs, migration et RGPD, tests), chacun renvoyant à une primitive existante. Le formatage Prettier est vérifié en CI après un reformatage unique du code.
- Intention : une base où le chemin sûr est le chemin le plus simple, pour faire évoluer le projet par petites touches sans réintroduire les failles corrigées pendant l'audit.
- Référence : `CLAUDE.md` (section Checklist), `29f9128`.

### Erreurs reconnues par code jusque dans les toasts

- Décision : les toasts d'échec des formulaires reconnaissent l'erreur à son code et non plus à son message.
- Effet : deux toasts qui ne se déclenchaient jamais (message attendu différent de celui du backend) fonctionnent ; renommer un message côté backend ne casse plus l'affichage.
- Référence : `c78d4b0`.

## Difficultés rencontrées

### XP gagnée en boucle

- Problème : retirer puis remettre une recommandation, un livre en bibliothèque ou un vote accordait l'XP à chaque fois.
- Découverte : pendant le chantier d'ajout de tests mené avec Claude.
- Solution : la clé `xpKey` et son index unique (`d3aafae`).
- Règle retenue (CLAUDE.md) : toujours dériver la clé d'un identifiant stable, jamais d'une entité supprimable.

### Recherche externe presque toujours en échec

- Problème : Open Library répond souvent en 4 à 8 s, alors que le timeout était de 3 s. Presque toutes les recherches externes étaient abandonnées, et les échecs n'étaient pas journalisés.
- Solution : timeout passé à 8 s, journalisation des échecs, normalisation des ISBN saisis (`ce9eaa9`).

### Suppression de compte par l'admin qui échouait

- Problème : la suppression par l'admin dupliquait une logique incomplète. Elle oubliait les commentaires et les catégories créées, et échouait sur une contrainte de clé étrangère dès que le compte avait commenté une critique.
- Solution : réutiliser `eraseUserAccount` (`97a9bcd`).

### Rôle admin inopérant sur les fiches des autres

- Problème : `updateBook` et `updateAuthor` ne cherchaient que parmi les fiches de l'utilisateur connecté. Le contrôle `isOwnerOrAdmin` ne pouvait donc jamais autoriser l'admin.
- Solution : filtrer sur le propriétaire uniquement pour les non-admins (`a1cc6bd`).

### Création d'auteur en concurrence

- Problème : deux créations simultanées du même auteur plantaient ou créaient un doublon (pattern check-then-act).
- Solution : contrainte unique `(firstname, lastname)` et `INSERT ... ON CONFLICT DO NOTHING` suivi d'une relecture (`c68f46d`).

### Politique de mot de passe contournable

- Problème : la règle de robustesse ne s'appliquait qu'à l'inscription. Le changement de mot de passe acceptait n'importe quelle valeur.
- Solution : règle définie une seule fois (`utils/password-policy.ts`) et appliquée aux deux parcours, avec son miroir côté front (`70cc4f6`, `9a20508`).

### Rate limiting contournable

- Problème : l'IP utilisée par le rate limiting était la première valeur de `X-Forwarded-For`, fournie par le client. Changer d'en-tête à chaque requête permettait de tenter des mots de passe sans limite.
- Solution : le nginx du front résout l'IP réelle avec le module realip et réécrit les en-têtes ; le back ne lit plus que `X-Real-IP` (`utils/client-ip.ts`). Vérifié en conteneur : des valeurs falsifiées n'empêchent plus le blocage au onzième essai (`55199b9`).

### Dépendances vulnérables

- Problème : l'audit des dépendances de production relevait 60 vulnérabilités, dont une critique, principalement via Apollo Server 4 arrivé en fin de vie.
- Solution : passage à Apollo Server 5, retrait des paquets inutilisés, montées mineures côté front. Il en reste 10, non exploitables dans l'usage du projet et documentées dans l'audit (`39aa1a2`, `96b59f9`, `d5bb2d7`).

### Codes d'erreur toujours génériques

- Problème : le format d'erreur testait `instanceof AppError` sur l'erreur enveloppée par Apollo, test jamais vrai. Toute erreur métier arrivait au client en `INTERNAL_SERVER_ERROR`, et les pages détail affichaient un 404 pour n'importe quelle panne, faute de code fiable.
- Solution : déballage avec `unwrapResolverError`, code dérivé du statut, détection par code côté front. Découvert en testant l'image de production dans un conteneur (`f9232d0`, `2f22cfb`).

### Modérateurs bloqués

- Problème : la plupart des endpoints exigeaient `@Authorized(Roles.User, Roles.Admin)`, ce qui excluait le rôle modérateur : il ne pouvait ni gérer sa bibliothèque ni critiquer.
- Solution : `@Authorized()` pour « toute session », convention notée dans `CLAUDE.md` (`ff5daa1`).

### Validation des auteurs désactivée par un copier-coller

- Problème : les règles des champs optionnels d'un auteur (biographie, nationalité, liens) étaient conditionnées à un champ de livre, `isbn10`, absent d'un auteur. Elles ne s'exécutaient donc jamais à la création.
- Solution : un décorateur partagé `SkipIfEmpty` pour les champs optionnels, et des liens limités à http(s) (`75d548c`).

### Ce que j'en retiens

- Mener seul (avec Claude) un projet de bout en bout, de la base de données au déploiement, demande de réfléchir à chaque couche, pas seulement aux fonctionnalités.
- La réflexion côté utilisateur, notamment la gamification, fait partie de la conception au même titre que la technique : ce qu'on récompense oriente ce que les utilisateurs font.

## Liens entre les parties

- Import externe → gamification : les fiches importées sont volontairement incomplètes, et l'XP de complétion pousse les utilisateurs à les enrichir.
- Gamification → catalogue : l'XP remplace la saisie manuelle du catalogue par l'auteur du projet.
- XP jamais retirée → déduplication par `xpKey` : la règle produit n'est tenable que grâce à la contrainte en base.
- Journal `UserActions` → fil d'activité et statistiques du profil : la même table sert à l'XP, au fil social et aux compteurs du profil (`lib/profileActivity.ts`).
- Catalogue construit par la communauté → anonymisation à l'effacement : supprimer les contributions d'un compte appauvrirait le catalogue commun.

## Limites et absences assumées

- Pas de notifications, de modération ni de signalement : périmètre MVP volontaire.
- Pas de recommandations personnalisées ni de recherche d'utilisateurs.
- Pas de logger structuré.
- Les durées de conservation RGPD sont annoncées dans les mentions légales, mais aucune purge automatique n'est implémentée.
- L'import d'un livre prend la première source qui répond (Open Library, sinon Google Books) sans fusionner les champs. La prévisualisation, elle, fusionne les deux sources (`book-search-resolver.ts`). Un livre importé peut donc avoir moins d'informations que sa prévisualisation.

## État et suite

- Début : 27 mars 2025 (`dc769a4`).
- État en juillet 2026 : projet considéré comme terminé. Toutes les fonctionnalités décrites sont en place, avec une CI (lint, typecheck, tests) et un déploiement CapRover documenté.
- Reprise en novembre 2026 : le projet est poursuivi sur du temps libre, à partir du MVP existant.
- Avant la roadmap, un audit de sécurité et de propreté du code (novembre 2026) pour repartir d'une base saine : rate limiting, pagination, dépendances et builds reproductibles d'abord, puis unification de la résolution de l'utilisateur courant, visibilité des données et convention pour les futurs endpoints.
- Développé avec l'assistance de Claude (Claude Code pour le code, Claude Design pour les maquettes).
- Suite prévue : une roadmap inspirée des applications de lecture existantes (Babelio, Goodreads, StoryGraph, Hardcover). Statut « abandonné » livré en premier (novembre 2026). Balises spoiler, classement mensuel et défi de lecture annuel ensuite. En tête : progression et journal de lecture, citations. Puis notifications, bilan annuel, recommandations personnalisées et modération. La purge automatique des données RGPD reste à faire. Détail : `docs/2026-05-31-review-technique-et-roadmap.md`.
