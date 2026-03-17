#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_help() {
  cat <<'EOF'
DealRail Skills Command

Usage:
  ./skills/dealrail.sh <command>

Commands:
  help              Show this help
  basics            Product basics and navigation model
  preflight         Quick preflight checklist for demo runs
  human-flow        Human-mode run order
  agent-flow        Agent-mode run order
  smoke-celo        Run Celo Sepolia smoke test from backend
  ledger            Open transaction ledger path
  where             Print key file paths

Examples:
  ./skills/dealrail.sh basics
  ./skills/dealrail.sh smoke-celo
EOF
}

cmd="${1:-help}"

case "$cmd" in
  help|-h|--help)
    print_help
    ;;
  basics)
    cat <<'EOF'
DealRail basics:
- Purpose: trustless deal execution rail for humans + agents.
- Core flow: discover -> negotiate -> confirm -> escrow -> submit -> evaluator decision.
- Human UI: pipeline first, jobs second, advanced tools optional.
- Agent UI: discovery + workbench first, then jobs validation.
EOF
    ;;
  preflight)
    cat <<'EOF'
Preflight checklist:
1) Wallet connected and funded for active chain gas.
2) Backend health endpoint reachable.
3) Escrow contract address visible and explorer link opens.
4) Role mapping clear: buyer/provider/evaluator.
5) Transaction ledger file path known.
EOF
    ;;
  human-flow)
    cat <<'EOF'
Human mode run order:
1) Run Deal Pipeline (set policy, counter rounds, confirm deal).
2) Create/fund job and track status.
3) Open Jobs List and verify state transitions.
4) Use Advanced section only when needed.
EOF
    ;;
  agent-flow)
    cat <<'EOF'
Agent mode run order:
1) Provider Discovery (select counterparties).
2) Integrations Workbench (x402, delegation, routing payloads).
3) Deal Pipeline/Jobs validation.
4) Record tx hashes in transaction ledger.
EOF
    ;;
  smoke-celo)
    (
      cd "$ROOT_DIR/backend"
      npm run smoke:celo-sepolia
    )
    ;;
  ledger)
    echo "$ROOT_DIR/backend/TRANSACTION_LEDGER.md"
    ;;
  where)
    cat <<EOF
Skill index: $ROOT_DIR/skills/README.md
Public skill index: $ROOT_DIR/frontend/public/SKILL.md
Frontend skill: $ROOT_DIR/skills/client-frontend/SKILL.md
Ledger: $ROOT_DIR/backend/TRANSACTION_LEDGER.md
EOF
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    print_help
    exit 1
    ;;
esac
