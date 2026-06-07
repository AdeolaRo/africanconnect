#!/usr/bin/env bash
# Mise à jour AfricanConnect sur le VPS (africanconnect.online)
# Usage : bash scripts/deploy-update.sh
#         bash scripts/deploy-update.sh --seed   (réinjecte aussi les données démo)

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/africanconnect-online}"
PM2_NAME="${PM2_NAME:-africanconnect-online}"
BRANCH="${BRANCH:-main}"
RUN_SEED=false

for arg in "$@"; do
  case "$arg" in
    --seed) RUN_SEED=true ;;
    -h|--help)
      echo "Usage: bash scripts/deploy-update.sh [--seed]"
      echo "  --seed  Exécute npm run db:seed après db push"
      exit 0
      ;;
    *)
      echo "Option inconnue: $arg (utilisez --help)"
      exit 1
      ;;
  esac
done

log() { echo "[deploy] $*"; }
fail() { echo "[deploy] ERREUR: $*" >&2; exit 1; }

[[ -d "$APP_DIR" ]] || fail "Dossier introuvable: $APP_DIR"
[[ -f "$APP_DIR/.env" ]] || fail "Fichier .env manquant dans $APP_DIR"

cd "$APP_DIR"

log "Dossier: $APP_DIR"
log "Branche: $BRANCH"

if [[ ! -d .git ]]; then
  fail "Ce dossier n'est pas un dépôt git"
fi

log "1/6 — git pull origin $BRANCH"
git fetch origin "$BRANCH"
git pull origin "$BRANCH"

log "2/6 — npm install"
npm install

log "3/6 — prisma db push (PostgreSQL prod)"
npx prisma db push

if $RUN_SEED; then
  log "4/6 — npm run db:seed"
  npm run db:seed
else
  log "4/6 — seed ignoré (ajoutez --seed si nécessaire)"
fi

log "5/6 — npm run build"
npm run build

log "6/6 — pm2 restart $PM2_NAME"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  fail "Process PM2 '$PM2_NAME' introuvable. Lancez d'abord le déploiement initial."
fi

pm2 save

log "Terminé ✓"
log "Vérification: curl -I https://africanconnect.online"
curl -fsI https://africanconnect.online | head -n 1 || log "Attention: curl HTTPS a échoué (DNS/nginx?)"
