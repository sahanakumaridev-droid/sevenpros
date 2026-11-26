#!/usr/bin/env bash
# Opens your existing Build Forces Google Web client so you can allow SevenPros.
set -euo pipefail
URL="https://console.cloud.google.com/auth/clients/868631513194-apu6g32ot0no1dhgkods6b72q7q88401.apps.googleusercontent.com?project=buildforces"
open -a "Google Chrome" "$URL" 2>/dev/null || open "$URL"
cat <<'TXT'

Add these under Authorized JavaScript origins, then Save:

  https://sevenpros.vercel.app
  http://localhost:5173
  http://127.0.0.1:5173

(Optional) Authorized redirect URIs — same three URLs.

TXT