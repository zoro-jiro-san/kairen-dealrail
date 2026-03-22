---
name: machine-payments-x402
description: Use whenever someone needs to decide between immediate machine payment and escrow, inspect x402 posture, or proxy an x402-protected request. Trigger on "x402", "machine payments", "pay-per-call", "payment challenge", "proxy paid request", or "should this be escrow or x402".
---

# Machine Payments X402

Use this skill when the interaction is immediate and endpoint-driven.

## Use When
- The endpoint is already known.
- The task is closer to an API call than a negotiated service deal.
- Someone needs to inspect or explain the x402 adapter surface.

## Primary Surfaces
- API: `GET /api/v1/integrations/x402/status`
- API: `POST /api/v1/integrations/x402/proxy`
- API: `GET /api/v1/payments/status`
- CLI: `dealrail rails`

## Decision Rule
- Use x402 when the buyer wants immediate paid access to a known endpoint.
- Use escrow when the work needs provider choice, submission, evaluation, or a rejection path.

## Required Output
- why x402 or escrow is the correct posture
- target endpoint, if x402 is chosen
- challenge status or paid response

## Hard Rules
- Do not present x402 as a replacement for escrow-backed service delivery.
- Keep the payment posture explanation short and concrete.
- If there is no known endpoint yet, push the flow back to discovery or negotiation.
