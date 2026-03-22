#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_URL="${DEALRAIL_API_URL:-http://localhost:3001}"
TYPE_SPEED="${TYPE_SPEED:-0.02}"
PAUSE_SHORT="${PAUSE_SHORT:-1.0}"
PAUSE_LONG="${PAUSE_LONG:-1.8}"
PROMPT="${PROMPT:-dealrail-demo$ }"

supports_color() {
  [[ -t 1 && -z "${NO_COLOR:-}" ]]
}

color() {
  local code="$1"
  local text="$2"
  if supports_color; then
    printf '\033[%sm%s\033[0m' "$code" "$text"
  else
    printf '%s' "$text"
  fi
}

banner() {
  printf '\033c'
  if supports_color; then
    printf '\033[36m'
  fi
  cat <<'EOF'
  ____             __ ____        _ __
 / __ \___  ____ _/ // __ \____ _(_) /
/ / / / _ \/ __ `/ // /_/ / __ `/ / / 
/ /_/ /  __/ /_/ / // _, _/ /_/ / / /  
\____/\___/\__,_/_//_/ |_|\__,_/_/_/   
EOF
  if supports_color; then
    printf '\033[0m'
  fi
  printf '\n'
  color "90" "recordable CLI walkthrough for DealRail"
  printf '\n'
  color "90" "api: ${API_URL}"
  printf '\n'
  printf '\n'
}

type_line() {
  local text="$1"
  printf '%s' "$PROMPT"
  if [[ "$TYPE_SPEED" == "0" || "$TYPE_SPEED" == "0.0" ]]; then
    printf '%s\n' "$text"
    return
  fi

  local i char
  for ((i=0; i<${#text}; i+=1)); do
    char="${text:$i:1}"
    printf '%s' "$char"
    sleep "$TYPE_SPEED"
  done
  printf '\n'
}

pause_short() {
  sleep "$PAUSE_SHORT"
}

pause_long() {
  sleep "$PAUSE_LONG"
}

run_scene() {
  local label="$1"
  local cmd="$2"

  printf '\n'
  color "33" "# ${label}"
  printf '\n'
  type_line "$cmd"
  (cd "$ROOT" && bash -lc "$cmd")
  pause_short
}

require_build() {
  if [[ ! -f "$ROOT/dist/cli.js" ]]; then
    color "33" "dist/cli.js not found, building CLI first...\n"
    (cd "$ROOT" && npm run build >/dev/null)
  fi
}

backend_available() {
  curl -fsS "${API_URL}/health" >/dev/null 2>&1
}

main() {
  banner
  require_build

  run_scene "Command Deck" "node dist/cli.js help"
  run_scene "ASCII Intro" "node dist/cli.js demo --loops 1 --delay 180"

  if backend_available; then
    run_scene "System Status" "DEALRAIL_API_URL=${API_URL} node dist/cli.js status --json"
    run_scene "Provider Scan" "DEALRAIL_API_URL=${API_URL} node dist/cli.js scan automation"
    run_scene "Buyer Procurement Run" "DEALRAIL_API_URL=${API_URL} node dist/cli.js vend \"automation benchmark report\" --budget 0.12 --hours 24 --json"
    run_scene "Recent Jobs" "DEALRAIL_API_URL=${API_URL} node dist/cli.js jobs --limit 4 --json"
    run_scene "Execution Rails" "DEALRAIL_API_URL=${API_URL} node dist/cli.js rails --json"
  else
    color "31" "backend not reachable at ${API_URL}"
    printf '\n'
    color "90" "start backend/dist/index-simple.js first if you want the live API scenes in the recording"
    printf '\n'
    pause_long
  fi

  printf '\n'
  color "32" "walkthrough complete"
  printf '\n'
}

main "$@"
