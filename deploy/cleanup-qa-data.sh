#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${1:-/var/www/teknikos/backend/data/teknikos.db}"

if [[ ! -f "$DB_PATH" ]]; then
  echo "Missing database: $DB_PATH" >&2
  exit 1
fi

sqlite3 "$DB_PATH" <<'SQL'
BEGIN IMMEDIATE;

DELETE FROM job_items
WHERE job_id IN (
  SELECT id FROM jobs WHERE title LIKE 'Service Lapangan QA-%'
);

DELETE FROM invoices
WHERE customer_id IN (
  SELECT id FROM customers WHERE name LIKE 'Pelanggan QA-%' OR email LIKE 'qa-%'
);

DELETE FROM contracts
WHERE customer_id IN (
  SELECT id FROM customers WHERE name LIKE 'Pelanggan QA-%' OR email LIKE 'qa-%'
);

DELETE FROM jobs
WHERE title LIKE 'Service Lapangan QA-%';

DELETE FROM technicians
WHERE name LIKE 'Teknisi QA-%';

DELETE FROM inventory
WHERE name LIKE 'Kapasitor QA-%' OR sku LIKE 'SKU-%';

DELETE FROM customers
WHERE name LIKE 'Pelanggan QA-%' OR email LIKE 'qa-%';

COMMIT;
SQL

echo "QA cleanup completed for $DB_PATH"
