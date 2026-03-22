#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_help() {
  cat <<'EOF'
DealRail Skills Command

Usage:
  ./skills.sh <command>
  ./skills/dealrail.sh <command>

Commands:
  help              Show this help
  index             Print skill index paths
  features          List feature skills
  basics            Product basics and navigation model
  preflight         Quick preflight checklist for demo runs
  human-flow        Human-mode run order
  agent-flow        Agent-mode run order
  discovery         Provider discovery run order
  negotiation       x402n negotiation run order
  escrow            Escrow lifecycle run order
  x402              Machine-payments run order
  base              Base service directory run order
  routing           Base treasury routing preview run order
  delegation        Delegation builder run order
  smoke-celo        Run Celo Sepolia smoke test from backend
  ledger            Open transaction ledger path
  where             Print key file paths

Examples:
  ./skills.sh basics
  ./skills.sh features
  ./skills.sh smoke-celo
EOF
}

cmd="${1:-help}"

case "$cmd" in
  help|-h|--help)
    print_help
    ;;
  index)
    cat <<'EOF'
DealRail skill index:
- Human/operator docs: frontend/public/skill.md
- Skill pack README: skills/README.md
- Role skills: buyer-agent, provider-agent, evaluator-agent
- Feature skills: discovery, negotiation, escrow, x402, base, routing, delegation
- Transaction guardrails: transaction-ops, checkpoints, client-frontend
EOF
    ;;
  features)
    cat <<'EOF'
Feature skills:
- provider-discovery -> visible supply, source mix, provider scans
- negotiation-auction -> vend, RFOs, counter rounds, batch confirm, receipts
- escrow-lifecycle -> create/fund/submit/complete/reject/refund jobs
- machine-payments-x402 -> immediate pay-per-call posture
- base-service-directory -> /base and /api/v1/base/agent-services
- treasury-routing-preview -> Base-only post-settlement routing preview
- delegation-builder -> MetaMask / ERC-7710 payloads and bounds
EOF
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
4) Use Docs for the human toggle and `/skill.md` for the agent index.
5) Use Advanced section only when needed.
EOF
    ;;
  agent-flow)
    cat <<'EOF'
Agent mode run order:
1) Start with `/skill.md` or `dealrail services --json`.
2) Provider Discovery (select counterparties).
3) Negotiation / vend flow if a provider is not fixed.
4) Escrow or x402 path depending on posture.
5) Record tx hashes in transaction ledger.
EOF
    ;;
  discovery)
    cat <<'EOF'
Provider discovery run order:
1) Read discovery sources.
2) Query providers with task, price ceiling, and reputation floor.
3) Decide whether supply is live, mixed, or mock-only.
4) Move to negotiation or queue demand.
EOF
    ;;
  negotiation)
    cat <<'EOF'
Negotiation run order:
1) Create RFO from policy bounds.
2) Inspect ranked offers.
3) Run counter rounds only when useful.
4) Batch and confirm one offer.
5) Hand off to escrow.
EOF
    ;;
  escrow)
    cat <<'EOF'
Escrow lifecycle run order:
1) Read job and current state.
2) Execute exactly one valid next transition.
3) Confirm tx hash and explorer link.
4) Re-read job and confirm resulting state.
EOF
    ;;
  x402)
    cat <<'EOF'
Machine-payments run order:
1) Confirm endpoint is already known.
2) Decide x402 vs escrow.
3) Probe x402 status or proxy the request.
4) Capture challenge or paid response.
EOF
    ;;
  base)
    cat <<'EOF'
Base directory run order:
1) Open /base or call GET /api/v1/base/agent-services.
2) Read public surfaces, visible supply, and settlement rail.
3) State whether the directory is curated_demo or live_blended.
EOF
    ;;
  routing)
    cat <<'EOF'
Treasury routing preview run order:
1) Confirm the job is Base Sepolia and Completed.
2) Build the post-settlement preview.
3) Read quote, slippage, and payloads.
4) Keep it labeled preview-only.
EOF
    ;;
  delegation)
    cat <<'EOF'
Delegation builder run order:
1) Define delegator, delegate, target, limit, and expiry.
2) Build payload.
3) Keep signing on the client side.
4) Do not claim delegated execution proof without a tx hash.
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
Shell entrypoint: $ROOT_DIR/skills.sh
Public skill index: $ROOT_DIR/frontend/public/SKILL.md
Public lowercase skill index: $ROOT_DIR/frontend/public/skill.md
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
