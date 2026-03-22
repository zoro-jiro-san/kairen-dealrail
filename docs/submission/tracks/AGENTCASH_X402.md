# AgentCash / x402

## Current Status

Ready for a strong claim on testnet.

The repo now includes canonical proof of a real paid x402 request on Base Sepolia testnet, in addition to the existing x402 proxy path and x402n negotiation surfaces.

## Core Files

- [`backend/src/services/x402n.service.ts`](../../../backend/src/services/x402n.service.ts)
- [`backend/src/services/x402.service.ts`](../../../backend/src/services/x402.service.ts)
- [`backend/src/index-simple.ts`](../../../backend/src/index-simple.ts)
- [`backend/tests/proof-x402-testnet.ts`](../../../backend/tests/proof-x402-testnet.ts)
- [`backend/TRANSACTION_LEDGER.md`](../../../backend/TRANSACTION_LEDGER.md)

## What Exists

- x402n negotiation session creation
- reverse-auction style rounds
- offer batching and confirmation
- x402 proxy endpoints
- real Base Sepolia paid x402 request with settlement tx evidence

## Canonical Proof

The current strong proof is:

1. paid request sent on `eip155:84532`
2. payment completed successfully
3. settlement tx recorded in the canonical ledger:
   - `0x8dfabc6a77205b0740aa7bc48e230b7516acc76295536d18a6a30db19476940c`

## Recommendation

Use this as a valid stretch track on a truthful testnet basis.

Important boundary:
- this strengthens the x402 paid-request claim
- it does not mean x402n negotiation is fully live beyond the recorded evidence
