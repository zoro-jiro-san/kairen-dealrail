---
name: provider-discovery
description: Use whenever a human or agent needs to inspect provider supply, filter candidates, compare discovery sources, or decide whether DealRail currently has enough visible market depth for a request. Trigger on requests like "scan providers", "discovery", "market depth", "who can do this", "provider radar", or "visible supply".
---

# Provider Discovery

Use this skill to decide whether DealRail can currently see enough supply to pursue a request.

## Use When
- Someone asks for providers, scans, discovery posture, or source mix.
- You need to know whether supply is `mock`, `imported`, or connected to a live feed.
- You need to explain why a request should move to negotiation, opportunity capture, or stop.

## Primary Surfaces
- Browser: `/terminal`, `/dashboard`, `/base`
- API: `GET /api/v1/discovery/providers`
- API: `GET /api/v1/discovery/sources`
- CLI: `dealrail providers <query>`
- CLI: `dealrail scan <query>`

## Workflow
1. Read discovery sources first.
2. Query providers with the task, reputation floor, price ceiling, and source filter when needed.
3. Check whether the returned supply is live, mixed, or mock-only.
4. If supply is sufficient, hand off to negotiation or escrow planning.
5. If supply is empty or weak, create an opportunity instead of pretending the market is deep.

## Required Output
- provider count
- source mix
- strongest visible candidates
- whether the next step is `negotiate`, `queue demand`, or `stop`

## Hard Rules
- Do not describe curated demo supply as a fully open live market.
- Call out `mock` supply explicitly.
- If there are zero relevant providers, say so directly.
