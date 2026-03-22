# DealRail Skills

Purpose: agent-friendly operations directory that centralizes how DealRail should be run by role.

Trigger policy:
- Pick one primary role skill (`buyer-agent`, `provider-agent`, or `evaluator-agent`).
- Add one or more feature skills when the request is about a concrete product surface.
- Add `transaction-ops` for any live onchain execution.
- Add `checkpoints` before demo/submission runs.
- Add `client-frontend` for UX/navigation or operator flow questions.

Main skills command:
- `./skills.sh`
- `./skills/dealrail.sh`
- Start here for navigation, preflight, flow guidance, and smoke execution.

## Available Skills

- `skills.sh` / `skills/dealrail.sh` (executable commands)
  - `help`, `index`, `features`, `basics`, `preflight`, `human-flow`, `agent-flow`, `discovery`, `negotiation`, `escrow`, `x402`, `base`, `routing`, `delegation`, `smoke-celo`, `ledger`, `where`

- `skills/transaction-ops/SKILL.md`
  - Build, validate, and execute transaction payloads (escrow, Uniswap, Locus).
- `skills/buyer-agent/SKILL.md`
  - Buyer-side workflow from policy definition to settlement.
- `skills/provider-agent/SKILL.md`
  - Provider-side workflow from offer to deliverable and optional swap.
- `skills/evaluator-agent/SKILL.md`
  - Evaluator-side verification and dispute/resolution behavior.
- `skills/client-frontend/SKILL.md`
  - Frontend interaction checklist and operator UX guardrails.
- `skills/checkpoints/SKILL.md`
  - System-level checkpoints by phase (before, during, after deal execution).
- `skills/provider-discovery/SKILL.md`
  - Discovery sources, visible supply, and provider-market truthfulness.
- `skills/negotiation-auction/SKILL.md`
  - x402n RFO creation, ranked offers, counter rounds, and receipts.
- `skills/escrow-lifecycle/SKILL.md`
  - Base/Celo onchain state transitions and job handling.
- `skills/machine-payments-x402/SKILL.md`
  - x402 posture and pay-per-call execution.
- `skills/base-service-directory/SKILL.md`
  - Base-facing public service surface and track proof.
- `skills/treasury-routing-preview/SKILL.md`
  - Base-only post-settlement routing preview.
- `skills/delegation-builder/SKILL.md`
  - MetaMask / ERC-7710 payload construction and limits.

## When To Use

- Use this directory whenever an agent/operator needs deterministic execution rules.
- Use the feature skills whenever the task maps to a concrete DealRail surface instead of a generic role.
- Use before demos to avoid track-breaking mistakes.

## When Not To Use

- Not a replacement for protocol specs/contract code.
- Not for deep security audits; use dedicated audit checklists for that.

## End Goal Use Case

Trustless B2B agent commerce:
1. Discover qualified providers.
2. Negotiate terms offchain (x402n RFO/offers).
3. Commit and settle onchain (DealRail escrow lifecycle).
4. Optionally route proceeds post-settlement (Uniswap/Locus).

## Not The Goal

- Being a standalone discovery marketplace.
- Replacing x402n or Kairen Market.
- Running unrestricted autonomous spending without delegation bounds.
