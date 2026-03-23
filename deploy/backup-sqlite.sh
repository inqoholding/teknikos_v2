#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/teknikos"
DB_DIR="$APP_ROOT/backend/data"
BACKUP_DIR="$APP_ROOT/backups"
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_DIR/teknikos.db" ]; then
  echo "Database file not found: $DB_DIR/teknikos.db" >&2
  exit 1
fi

sqlite3 "$DB_DIR/teknikos.db" ".backup '$BACKUP_DIR/teknikos_$TIMESTAMP.db'"
find "$BACKUP_DIR" -type f -name "teknikos_*.db" -mtime +14 -delete

echo "Backup created at $BACKUP_DIR/teknikos_$TIMESTAMP.db"
