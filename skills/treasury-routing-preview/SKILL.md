---
name: treasury-routing-preview
description: Use whenever someone asks about the Base-only post-settlement routing flow, Uniswap preview payloads, or what happens after a completed Base job. Trigger on "treasury routing", "Uniswap preview", "post-settlement routing", "completed Base job", or "route payout".
---

# Treasury Routing Preview

Use this skill only after settlement, and only on Base.

## Use When
- A Base Sepolia job is already `Completed`.
- Someone wants the post-settlement routing preview payload.
- The goal is to inspect routing, not pretend there is sponsor-grade swap proof.

## Primary Surfaces
- Browser: completed Base job page
- API: `GET /api/v1/integrations/uniswap/post-settlement/:jobId?chain=baseSepolia`
- Browser: integrations workbench preview path

## Workflow
1. Confirm the job is on Base Sepolia.
2. Confirm the job state is `Completed`.
3. Build the routing preview.
4. Read quote, slippage, approve payload, and swap payload.
5. Keep the result labeled as preview-only.

## Hard Rules
- Do not use this on Celo jobs.
- Do not claim live swap execution unless a real tx hash exists.
- Do not use this as the first step of a deal.
