---
name: negotiation-auction
description: Use whenever someone needs to create or inspect x402n RFOs, ranked offers, counter rounds, batch confirmation, or savings receipts. Trigger on "vend", "negotiate", "auction", "counter round", "RFO", "offer ranking", "batch confirm", or "receipt from negotiation".
---

# Negotiation And Auction

Use this skill to run the offer-formation layer before escrow.

## Use When
- A buyer has a task, budget, and delivery window.
- Provider supply exists and the next step is ranking or negotiation.
- Someone needs to explain the x402n-backed negotiation posture in DealRail.

## Primary Surfaces
- Browser: `DealPipelineDashboard`, terminal `vend`
- API: `POST /api/v1/x402n/rfos`
- API: `POST /api/v1/x402n/rfos/:negotiationId/counter`
- API: `POST /api/v1/x402n/rfos/:negotiationId/batch`
- API: `POST /api/v1/x402n/rfos/:negotiationId/confirm`
- API: `GET /api/v1/x402n/rfos/:negotiationId/receipt`

## Workflow
1. Capture policy bounds: requirement, budget, delivery window, reputation floor.
2. Create negotiation.
3. Inspect ranked offers.
4. Run counter rounds only when there is real competition to improve.
5. Create a batch and confirm one selected offer.
6. Pass the confirmed deal into escrow or another execution posture.

## Required Output
- negotiation ID
- number of offers
- best visible offer
- confirmation or receipt, if the flow reached that stage

## Hard Rules
- Do not treat negotiation as proof of live public market depth if the catalog is still curated.
- Keep budget and delivery bounds explicit.
- Do not skip from negotiation into settlement without a confirmed offer.
