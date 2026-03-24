#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${1:-/var/www/teknikos/backend/data/rate-limit.sqlite}"

if [[ ! -f "$DB_PATH" ]]; then
  echo "Missing rate-limit database: $DB_PATH" >&2
  exit 1
fi

sqlite3 "$DB_PATH" "DELETE FROM rate_limits WHERE namespace = 'auth';"
echo "Auth rate-limit counters cleared for $DB_PATH"
