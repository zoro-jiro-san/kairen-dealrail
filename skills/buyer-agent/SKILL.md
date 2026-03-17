---
name: buyer-agent
description: Use for buyer-side agent execution: policy setup, negotiation, offer acceptance, and escrow funding within strict bounds.
---

# Buyer Agent

## Use When
- Human or agent needs to run buyer flow end-to-end.
- Policy-bounded negotiation and funding is required.

## Inputs
- Service requirement
- Max budget
- Max delivery window
- Min reputation

## Workflow
1. Set policy bounds.
2. Create negotiation (`/x402n/rfos`).
3. Run counter rounds if needed.
4. Accept offer and confirm batch.
5. Create and fund escrow job.
6. Hand off to provider/evaluator.

## Hard Rules
- Never sign out-of-policy spends.
- `fund` amount must match confirmed budget.
- Keep tx hash + explorer link for each step.
