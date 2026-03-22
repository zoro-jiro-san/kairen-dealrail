# AgentCash / x402

## Current Status

Partial.

The repo has x402n negotiation surfaces and an x402 proxy path, but it does not yet include canonical proof of a paid x402 request.

## Core Files

- [`backend/src/services/x402n.service.ts`](../../../backend/src/services/x402n.service.ts)
- [`backend/src/services/x402.service.ts`](../../../backend/src/services/x402.service.ts)
- [`backend/src/index-simple.ts`](../../../backend/src/index-simple.ts)

## What Exists

- x402n negotiation session creation
- reverse-auction style rounds
- offer batching and confirmation
- x402 proxy endpoints

## What Is Missing For A Strong Claim

Add one real paid request or x402-native service proof:

1. request sent
2. payment completed
3. proof recorded in repo or ledger

## Recommendation

Do not use AgentCash or x402 as a primary win path unless the paid-request proof exists before final submission.
