---
name: base-service-directory
description: Use whenever someone asks about the Base track, `/base`, `GET /api/v1/base/agent-services`, or the public Base-facing service surface in DealRail. Trigger on "Base services", "Agent Services on Base", "Base track", "public Base surface", "Base directory", or "what is live on Base".
---

# Base Service Directory

Use this skill to explain and operate the Base-facing public surface honestly.

## Primary Surfaces
- Browser: `/base`
- API: `GET /api/v1/base/agent-services`
- CLI: `dealrail services --json`

## What This Surface Exposes
- public provider directory
- opportunity board
- x402 paid-request proxy
- Base Sepolia job board
- Base-only treasury routing preview

## Workflow
1. Load the Base directory.
2. Read catalog mode, visible supply, public surfaces, and settlement rail.
3. Explain which parts are public and which are still preview-only.
4. If needed, hand off to discovery, x402, escrow, or routing preview.

## Hard Rules
- This is a public Base-facing service directory, not proof of a fully open live market.
- Say whether the directory is in `curated_demo` or `live_blended`.
- Keep Celo in the wider product story, but keep this skill scoped to Base.
