# DealRail Skill Index

Canonical URL: `https://dealrail.kairen.xyz/SKILL.md`
Lowercase alias: `https://dealrail.kairen.xyz/skill.md`

DealRail is an execution desk for agent commerce.
Use this index when an agent needs to decide how to operate DealRail without loading the whole repo first.

## Start Here

1. Read this file.
2. If the task is Base-track or public-surface oriented, open `/base`.
3. If the task is guided operation, open `/docs` and choose the human or agent toggle from the top shell.
4. If the task is command-driven, use the CLI or the local `skills.sh` helper.

## Entry Modes

### Human Mode

Use when:
- a person wants guided navigation
- wallet actions need visual confirmation
- the flow is being demoed or judged live

Start with:
- `/docs`
- `/terminal`
- `/dashboard`

Recommended order:
1. `doctor`
2. `services`
3. `vend ...` or job operations
4. `/base` when the Base-facing service surface matters

### Agent Mode

Use when:
- another runtime needs stable JSON
- the task is feature-specific and should map to a skill
- the browser should be used only for human review or signing

Start with:
- `npx @kairenxyz/dealrail doctor --json`
- `npx @kairenxyz/dealrail services --json`
- `./skills.sh features`

## Public Product Surfaces

- `/base`
  - Base-facing public service directory
- `/docs`
  - human/agent operating guide
- `/terminal`
  - guided operator terminal
- `GET /api/v1/base/agent-services`
  - Base public API directory
- `GET /api/v1/discovery/providers`
  - provider discovery
- `POST /api/v1/x402n/rfos`
  - negotiation entrypoint
- `GET /api/v1/jobs`
  - job board

## Local Skill Pack

Shell entrypoints:
- `./skills.sh`
- `./skills/dealrail.sh`

Core role skills:
- `skills/buyer-agent/SKILL.md`
- `skills/provider-agent/SKILL.md`
- `skills/evaluator-agent/SKILL.md`
- `skills/transaction-ops/SKILL.md`
- `skills/checkpoints/SKILL.md`
- `skills/client-frontend/SKILL.md`

Feature skills:
- `skills/provider-discovery/SKILL.md`
  - provider scans, source mix, visible market depth
- `skills/negotiation-auction/SKILL.md`
  - RFOs, offer ranking, counter rounds, batch confirm, receipts
- `skills/escrow-lifecycle/SKILL.md`
  - create, fund, submit, complete, reject, refund
- `skills/machine-payments-x402/SKILL.md`
  - x402 pay-per-call posture and proxy flows
- `skills/base-service-directory/SKILL.md`
  - Base-facing public surface and track proof
- `skills/treasury-routing-preview/SKILL.md`
  - Base-only post-settlement routing preview
- `skills/delegation-builder/SKILL.md`
  - MetaMask / ERC-7710 payload construction and bounds

Repo-local reference skills:
- `.agents/skills/viem-integration/SKILL.md`
- `.agents/skills/swap-integration/SKILL.md`
- `.agents/skills/swap-planner/SKILL.md`
- `.agents/skills/pay-with-any-token/SKILL.md`

These are repo-local paths, not public URLs served by the frontend.

## Feature Routing

Use this map to choose the right skill quickly.

- "Who can do this?" -> `provider-discovery`
- "Create a negotiation / vend / counter round" -> `negotiation-auction`
- "Create or advance a job" -> `escrow-lifecycle`
- "Should this be x402 or escrow?" -> `machine-payments-x402`
- "Show me what is live on Base" -> `base-service-directory`
- "Route payout after Base settlement" -> `treasury-routing-preview`
- "Delegate bounded wallet actions" -> `delegation-builder`
- "Need UI or navigation guidance" -> `client-frontend`

## Hard Truths

- DealRail is strongest today as escrow + receipts + operator packaging.
- Discovery can still be curated demo supply.
- Base service directory is real, but it is not proof of a fully open live market.
- Uniswap is preview-only until a real swap tx exists.
- Delegation is a builder/signing path until a delegated tx exists.

## Security Guardrails

- Never ask for or paste raw private keys, seed phrases, or mnemonics into DealRail.
- Keep signing client-side or on documented managed demo signers only.
- Verify chain, role, job state, and route type before any mutating action.
- Treat `smoke-celo` and similar funded-chain tests as explicit operator actions, not default agent steps.

## Recommended Commands

```bash
npx @kairenxyz/dealrail doctor --json
npx @kairenxyz/dealrail services --json
npx @kairenxyz/dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json
./skills.sh features
./skills.sh base
```
