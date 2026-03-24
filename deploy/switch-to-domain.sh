#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/teknikos"
BACKEND_ENV="$APP_ROOT/backend/.env"
FRONTEND_ENV="$APP_ROOT/frontend/.env.production"
NGINX_TEMPLATE="$APP_ROOT/deploy/nginx.teknikos.conf"
NGINX_SITE="/etc/nginx/sites-available/teknikos"

DOMAIN="${1:-}"
WWW_DOMAIN="${2:-}"

if [[ -z "$DOMAIN" ]]; then
  echo "Usage: $0 <domain> [www-domain]" >&2
  exit 1
fi

if [[ ! -f "$BACKEND_ENV" || ! -f "$FRONTEND_ENV" || ! -f "$NGINX_TEMPLATE" ]]; then
  echo "Required deploy files are missing." >&2
  exit 1
fi

BASE_URL="https://$DOMAIN"
SERVER_NAMES="$DOMAIN"
if [[ -n "$WWW_DOMAIN" ]]; then
  SERVER_NAMES="$SERVER_NAMES $WWW_DOMAIN"
fi

sed -i "s|^BETTER_AUTH_URL=.*$|BETTER_AUTH_URL=$BASE_URL|" "$BACKEND_ENV"
sed -i "s|^FRONTEND_URL=.*$|FRONTEND_URL=$BASE_URL|" "$BACKEND_ENV"
sed -i "s|^VITE_API_URL=.*$|VITE_API_URL=/api|" "$FRONTEND_ENV"
sed -i "s|^[[:space:]]*server_name .*;|    server_name $SERVER_NAMES;|" "$NGINX_TEMPLATE"

cp "$NGINX_TEMPLATE" "$NGINX_SITE"
ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/teknikos
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx
pm2 restart teknikos-backend --update-env

echo "Domain switch applied for: $SERVER_NAMES"
echo "Next step:"
if [[ -n "$WWW_DOMAIN" ]]; then
  echo "certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"
else
  echo "certbot --nginx -d $DOMAIN"
fi
