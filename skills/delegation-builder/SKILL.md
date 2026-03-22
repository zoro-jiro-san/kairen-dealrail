---
name: delegation-builder
description: Use whenever someone asks about MetaMask delegation payloads, bounded agent authorization, ERC-7710 builder flows, or letting an agent act within explicit limits. Trigger on "delegation", "MetaMask", "bounded agent permissions", "ERC-7710", or "delegate escrow actions".
---

# Delegation Builder

Use this skill for bounded authorization, not for direct settlement.

## Use When
- A human wallet wants to delegate narrow escrow authority to an agent.
- Someone needs the typed-data payload or bounds explanation.
- The question is about authorization policy rather than market execution.

## Primary Surfaces
- Browser: integrations workbench delegation builder
- API: `POST /api/v1/integrations/metamask/delegation/build`

## Workflow
1. Identify delegator, delegate, target escrow, limit, and expiry.
2. Build the delegation payload.
3. Explain allowed methods and boundaries.
4. If signing is needed, keep it on the client side.

## Hard Rules
- Treat this as a builder/signing path unless there is a real delegated tx hash.
- Keep expiry and spend bounds explicit.
- Do not present delegation as already evidenced if there is no onchain proof.
