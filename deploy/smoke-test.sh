#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/teknikos"
ENV_FILE="$APP_ROOT/backend/.env"
COOKIE_JAR="$(mktemp)"
CSRF_HEADER="x-teknikos-csrf: 1"
trap 'rm -f "$COOKIE_JAR"' EXIT

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

BASE_URL="${1:-http://127.0.0.1}"
AUTH_ORIGIN="${FRONTEND_URL:-http://156.67.220.110}"

for cmd in curl grep mktemp; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "Required command not found: $cmd" >&2
    exit 1
  }
done

check_contains() {
  local name="$1"
  local body="$2"
  local pattern="$3"
  if ! grep -q "$pattern" <<<"$body"; then
    echo "Smoke test failed: $name" >&2
    echo "$body" >&2
    exit 1
  fi
  echo "PASS $name"
}

login_and_verify() {
  local label="$1"
  local email="$2"
  local password="$3"
  : >"$COOKIE_JAR"

  local login_response
  login_response="$(curl -sS -c "$COOKIE_JAR" -H 'Content-Type: application/json' \
    -H "Origin: $AUTH_ORIGIN" \
    -H "$CSRF_HEADER" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}" \
    "$BASE_URL/api/auth/sign-in/email")"
  check_contains "$label login" "$login_response" "\"user\""

  local session_response
  session_response="$(curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/auth/get-session")"
  check_contains "$label session" "$session_response" "$email"

  curl -sS -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST -H "Origin: $AUTH_ORIGIN" -H "$CSRF_HEADER" "$BASE_URL/api/auth/sign-out" >/dev/null
}

home_response="$(curl -sS "$BASE_URL/")"
check_contains "homepage" "$home_response" "<!doctype html>"

health_response="$(curl -sS "$BASE_URL/api/health")"
check_contains "health" "$health_response" "\"ok\":true"

login_and_verify "admin" "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
login_and_verify "moderator" "$MODERATOR_EMAIL" "$MODERATOR_PASSWORD"
login_and_verify "owner" "$DEMO_OWNER_EMAIL" "$DEMO_OWNER_PASSWORD"

echo "Smoke test completed for $BASE_URL"
