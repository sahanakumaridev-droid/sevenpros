#!/usr/bin/env bash
# Usage: BREVO_API_KEY=xkeysib-... EMAIL_FROM='SevenPros <you@gmail.com>' ./scripts/wire-brevo.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -z "${BREVO_API_KEY:-}" ]]; then
  echo "Set BREVO_API_KEY first (from Brevo → SMTP & API → API keys)." >&2
  exit 1
fi

FROM="${EMAIL_FROM:-SevenPros <hello@sevenpros.com>}"

# Local API
ENV_FILE="$ROOT/backend/.env"
touch "$ENV_FILE"
grep -v '^BREVO_API_KEY=' "$ENV_FILE" 2>/dev/null | grep -v '^EMAIL_FROM=' >"$ENV_FILE.tmp" || true
mv "$ENV_FILE.tmp" "$ENV_FILE"
{
  echo "BREVO_API_KEY=$BREVO_API_KEY"
  echo "EMAIL_FROM=$FROM"
} >>"$ENV_FILE"

# Vercel API (production)
cd "$ROOT/backend"
printf '%s' "$BREVO_API_KEY" | vercel env add BREVO_API_KEY production 2>/dev/null || printf '%s' "$BREVO_API_KEY" | vercel env rm BREVO_API_KEY production -y 2>/dev/null; printf '%s' "$BREVO_API_KEY" | vercel env add BREVO_API_KEY production
printf '%s' "$FROM" | vercel env add EMAIL_FROM production 2>/dev/null || true

vercel --prod --yes

echo "Deployed. Test: curl -sS -X POST https://sevenpros-api.vercel.app/api/auth/email/login-start -H 'Content-Type: application/json' -d '{\"email\":\"YOUR_EMAIL\",\"password\":\"...\"}' | jq"
echo "If dev_otp is missing and email arrives, Brevo is live."