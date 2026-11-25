#!/usr/bin/env bash
# Construit l'archive de déploiement CapRover d'une app du monorepo.
#
# Usage : scripts/caprover-archive.sh <backend|frontend> [ref] [sortie]
#   ref    : branche ou commit à déployer (défaut : origin/test). Une ref
#            distante (origin/…) est d'abord récupérée : la prod reçoit
#            exactement ce qui a été poussé et vérifié par la CI, jamais des
#            commits locaux non poussés.
#   sortie : chemin du tar (défaut : /tmp/<app>.tar)
#
# L'archive contient le dossier de l'app à sa racine (captain-definition et
# contexte de build au bon endroit) plus un dossier `_workspace/` avec le
# lockfile et les manifestes du workspace pnpm. `Dockerfile.prod` s'en sert
# pour un `pnpm install --frozen-lockfile` : les versions installées en prod
# sont exactement celles vérifiées par la CI.
#
# Seuls les fichiers commités sur `ref` sont envoyés (pas de .env local).
set -euo pipefail

app="${1:?usage: $0 <backend|frontend> [ref] [sortie]}"
ref="${2:-origin/test}"
out="${3:-/tmp/${app}.tar}"

case "$app" in
    backend | frontend) ;;
    *) echo "app inconnue : $app (backend ou frontend)" >&2; exit 1 ;;
esac

cd "$(git rev-parse --show-toplevel)"

if [[ "$ref" == origin/* ]]; then
    git fetch --quiet origin "${ref#origin/}"
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

git archive "$ref:app/$app" | tar -x -C "$tmp"

# Manifestes du workspace aux mêmes chemins relatifs que dans le repo : les
# importers du lockfile (app/backend, app/frontend) doivent tous exister.
ws="$tmp/_workspace"
mkdir -p "$ws/app/backend" "$ws/app/frontend"
for file in pnpm-lock.yaml pnpm-workspace.yaml package.json \
    app/backend/package.json app/frontend/package.json; do
    git show "$ref:$file" > "$ws/$file"
done

tar -cf "$out" -C "$tmp" .
echo "Archive $app ($ref, $(git rev-parse --short "$ref")) : $out"
