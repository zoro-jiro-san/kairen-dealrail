# DealRail Skills

Purpose: agent-friendly operations directory that centralizes how DealRail should be run by role.

## Available Skills

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

## When To Use

- Use this directory whenever an agent/operator needs deterministic execution rules.
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
