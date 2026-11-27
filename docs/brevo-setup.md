# Envoi des emails avec Brevo — de zéro

Ce guide part d'un compte Brevo tout juste créé et s'arrête aux emails de
Nuit d'Encre (confirmation d'adresse, mot de passe oublié) reçus en prod.
Chaque étape se termine par une vérification.

Les écrans de Brevo changent souvent : si un libellé diffère, cherche
l'équivalent, et recopie toujours les valeurs DNS **affichées par Brevo**
plutôt que les exemples de ce guide.

---

## 0. Comment ça marche

- Le back appelle **l'API HTTP** de Brevo (`services/mail/mail-service.ts`) avec
  une clé API. **Pas de SMTP** : Brevo affiche aussi des identifiants SMTP, on
  ne s'en sert pas.
- Pour que les mails partent au nom de `no-reply@nuitdencre.fr` sans finir en
  spam, il faut prouver que tu contrôles le domaine. C'est le rôle des
  enregistrements DNS ajoutés chez OVH :
  - **code Brevo** (TXT) : prouve que le domaine est à toi ;
  - **DKIM** (2 CNAME) : Brevo signe chaque mail, et la messagerie du
    destinataire vérifie la signature grâce à ces enregistrements ;
  - **DMARC** (TXT) : dit aux messageries quoi faire d'un mail qui échoue aux
    contrôles, et envoie des rapports.
- Sans clé Brevo (en dev), les mails s'affichent dans les logs du back. En
  prod, l'absence de clé est une erreur : **plus personne ne peut confirmer son
  compte**. Fais ce guide **avant** de déployer le palier 0 bis.

Offre gratuite : 300 mails par jour.

---

## 1. Finaliser le compte Brevo

1. Complète le profil demandé à la première connexion (nom, adresse, type
   d'usage). Brevo peut valider le compte avant d'autoriser l'envoi : si un
   bandeau demande une validation, fais-la d'abord.
2. Si Brevo propose d'activer l'emailing **transactionnel**, active-le. C'est
   le type d'envoi utilisé ici (mails déclenchés par une action de
   l'utilisateur, pas une newsletter).

✅ *Vérification* : le menu **Transactionnel** est accessible et aucun bandeau
ne bloque l'envoi.

---

## 2. Ajouter le domaine dans Brevo

1. Menu du compte (en haut à droite) → **Paramètres** → **Expéditeurs,
   domaines et IP dédiées** → onglet **Domaines** → **Ajouter un domaine**.
2. Saisis `nuitdencre.fr`.
3. Si Brevo propose de se connecter à OVH pour configurer le DNS
   automatiquement, tu peux l'accepter et passer directement à la
   vérification de l'étape 3. Sinon, choisis la **configuration manuelle** :
   Brevo affiche une liste d'enregistrements à créer. Garde cet écran ouvert.

La liste ressemble à ceci (les valeurs exactes sont propres à ton compte) :

| Type | Nom | Valeur |
|---|---|---|
| TXT | `nuitdencre.fr` | `brevo-code:0123456789abcdef…` |
| CNAME | `brevo1._domainkey.nuitdencre.fr` | `b1.nuitdencre-fr.dkim.brevo.com` |
| CNAME | `brevo2._domainkey.nuitdencre.fr` | `b2.nuitdencre-fr.dkim.brevo.com` |
| TXT | `_dmarc.nuitdencre.fr` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |

Si Brevo demande aussi un enregistrement **SPF** (TXT commençant par
`v=spf1`), ajoute-le aussi, en suivant la règle de l'étape 3 : un seul
enregistrement SPF par domaine.

---

## 3. Créer les enregistrements chez OVH

Espace client OVH → **Web Cloud** → **Noms de domaine** → `nuitdencre.fr` →
onglet **Zone DNS** → **Ajouter une entrée**. Une entrée par ligne du tableau
de Brevo.

**Règle OVH** : le champ *Sous-domaine* ne prend que la partie **à gauche** du
domaine, OVH ajoute `.nuitdencre.fr` tout seul.

| Ligne Brevo | Type OVH | Sous-domaine | Valeur / cible |
|---|---|---|---|
| code Brevo | TXT | *(vide)* | `brevo-code:…` (copié de Brevo) |
| DKIM 1 | CNAME | `brevo1._domainkey` | `b1.….dkim.brevo.com.` |
| DKIM 2 | CNAME | `brevo2._domainkey` | `b2.….dkim.brevo.com.` |
| DMARC | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |

Pièges :

- **Cible des CNAME** : c'est un nom complet. OVH attend un point final
  (`…brevo.com.`) ; s'il ne l'ajoute pas lui-même, mets-le. Sans lui, OVH
  ajouterait `.nuitdencre.fr` à la fin de la cible.
- **Guillemets** : ne colle pas les guillemets autour des valeurs TXT, OVH les
  gère.
- **Un seul DMARC** : si un TXT `_dmarc` existe déjà dans la zone, modifie-le
  au lieu d'en créer un second (deux DMARC = DMARC invalide).
- **Un seul SPF** : si la zone contient déjà un TXT `v=spf1 …` (OVH en crée un
  pour son offre mail, par exemple `v=spf1 include:mx.ovh.com -all`) et que
  Brevo en demande un, **fusionne** les deux en une seule ligne :
  `v=spf1 include:mx.ovh.com include:spf.brevo.com -all`, avec la valeur
  exacte donnée par Brevo.
- Ne touche pas aux enregistrements existants du site (A, AAAA, joker
  `*.captain`) ni aux MX.

La propagation prend de quelques minutes à quelques heures, 48 h au maximum.

✅ *Vérification* depuis ton terminal :

```bash
dig +short TXT nuitdencre.fr                       # contient brevo-code:…
dig +short CNAME brevo1._domainkey.nuitdencre.fr   # b1.….dkim.brevo.com.
dig +short CNAME brevo2._domainkey.nuitdencre.fr   # b2.….dkim.brevo.com.
dig +short TXT _dmarc.nuitdencre.fr                # v=DMARC1; …
```

Quand les quatre répondent, reviens dans Brevo → **Domaines** →
`nuitdencre.fr` → **Authentifier** (ou **Vérifier**). Les lignes passent au
vert une à une : il suffit de relancer la vérification plus tard pour celles
qui ne se sont pas encore propagées.

---

## 4. Créer l'expéditeur

1. **Paramètres** → **Expéditeurs, domaines et IP dédiées** → onglet
   **Expéditeurs** → **Ajouter un expéditeur**.
2. Nom : `Nuit d'Encre`. Email : `no-reply@nuitdencre.fr`.
3. Avec un domaine authentifié, l'expéditeur est en général validé d'office.
   Si Brevo envoie quand même un code de confirmation à cette adresse, il te
   faut une boîte qui la reçoit : crée une **redirection email** OVH
   (`no-reply@nuitdencre.fr` vers ta boîte perso, onglet *Emails* du domaine),
   ou choisis une adresse que tu reçois déjà.

✅ *Vérification* : l'expéditeur apparaît comme vérifié ou actif.

---

## 5. Générer la clé API

1. Menu du compte → **SMTP et API** (ou **Paramètres** → **Clés API**) →
   onglet **Clés API** → **Générer une nouvelle clé API**.
2. Nom : `nuit-encre-prod`.
3. **Copie la clé tout de suite** : Brevo ne l'affiche qu'une fois. Garde-la
   dans ton gestionnaire de mots de passe, jamais dans le repo.

Ne prends pas la *clé SMTP* : c'est une autre clé, inutile ici.

---

## 6. Autoriser l'IP du VPS

Brevo peut bloquer une clé API utilisée depuis une adresse IP inconnue, et le
back recevrait alors une erreur 401.

1. Sur le VPS :

   ```bash
   curl -4 https://api.ipify.org   # IPv4 sortante
   curl -6 https://api64.ipify.org # IPv6, si le VPS en a une
   ```

2. Brevo → **Paramètres** → **Sécurité** → **IP autorisées** →
   **Autoriser une adresse IP** : ajoute l'IPv4, et l'IPv6 si la seconde
   commande a répondu.

Si Brevo t'envoie plus tard un mail « adresse IP bloquée » pour l'IP du VPS,
c'est cette étape : autorise-la depuis le mail ou depuis ce même écran.

---

## 7. Saisir les variables dans CapRover

Dashboard CapRover → **Apps** → `nuit-encre-back` → **App Configs** →
*Environmental Variables* → ajoute :

| Variable | Valeur |
|---|---|
| `BREVO_API_KEY` | la clé de l'étape 5 |
| `MAIL_FROM_EMAIL` | `no-reply@nuitdencre.fr` |
| `MAIL_FROM_NAME` | `Nuit d'Encre` (facultatif, c'est la valeur par défaut) |
| `APP_URL` | `https://nuitdencre.fr` (**sans** slash final : base des liens des mails) |

**Save & Update** redémarre le back avec les nouvelles variables.

Rien à faire côté front ni dans la CSP nginx : c'est le back qui appelle Brevo,
jamais le navigateur.

---

## 8. Déployer

Comme d'habitude (voir [`deployment-caprover.md`](./deployment-caprover.md)) :
pousser sur `test`, attendre la CI verte, puis `pnpm deploy:all`. La migration
`EmailVerification1790000000000` est jouée au démarrage du back.

À savoir : les comptes existants créés par email et mot de passe ne sont pas
vérifiés. Ils devront confirmer leur adresse (lien « Renvoyer le lien » sur
l'écran de connexion, ou « Mot de passe oublié », qui vérifie aussi l'adresse).
L'admin et les comptes Google sont vérifiés d'office.

---

## 9. Tester en prod

1. Inscris-toi avec une vraie adresse que tu lis : l'écran « Vérifiez votre
   boîte mail » s'affiche.
2. Le mail « Confirmez votre adresse email » arrive (regarde aussi les
   indésirables). Le lien mène à `https://nuitdencre.fr/verifier-email?token=…`,
   puis « Adresse confirmée ».
3. Connecte-toi : ça passe.
4. Déconnecte-toi, puis **Mot de passe oublié ?** → mail reçu → nouveau mot de
   passe → connexion avec ce nouveau mot de passe.
5. Brevo → **Transactionnel** → **Logs** (ou **Statistiques**) : les deux
   mails apparaissent comme délivrés.

Pour noter la délivrabilité : envoie un « Mot de passe oublié » vers l'adresse
de test donnée par [mail-tester.com](https://www.mail-tester.com) depuis un
compte créé avec cette adresse. Un score de 9/10 ou plus veut dire que DKIM et
DMARC sont bons.

---

## 10. Dépannage

Les erreurs d'envoi sont dans les logs du back (CapRover → `nuit-encre-back`
→ *App Logs*), sous `Verification email failed` ou `Password reset email
failed`, avec la réponse de Brevo.

| Symptôme | Cause probable |
|---|---|
| `Brevo 401` | clé API erronée, ou IP du VPS non autorisée (étape 6) |
| `Brevo 400` qui parle du sender | expéditeur non créé ou non validé (étape 4), ou `MAIL_FROM_EMAIL` différent de l'expéditeur créé |
| `BREVO_API_KEY is not defined` / `APP_URL is not defined` | variable absente dans CapRover (étape 7) |
| Mails reçus en indésirables | domaine pas entièrement authentifié dans Brevo (étape 3) |
| Aucun mail, aucune erreur dans les logs | normal si l'adresse n'a pas de compte, si le compte est déjà vérifié, ou si un mail est parti il y a moins d'une minute |
| `Brevo 402` ou quota | 300 mails par jour dépassés (offre gratuite) |

---

## 11. Plus tard (facultatif)

Après quelques semaines de rapports DMARC sans échec (Brevo les affiche si tu
as gardé `rua=mailto:rua@dmarc.brevo.com`), tu peux durcir la politique en
passant `p=none` à `p=quarantine` dans le TXT `_dmarc`. Les mails qui usurpent
ton domaine finiront alors en indésirables.
