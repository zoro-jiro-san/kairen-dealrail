# Uniswap

## Current Status

Partial.

The repo contains quote and transaction-building logic, and current official Uniswap docs now support Base Sepolia through the Trading API, but the canonical ledger does not yet include an executed Uniswap swap tx.

## Core File

- [`backend/src/services/uniswap.service.ts`](../../../backend/src/services/uniswap.service.ts)

## What Exists

- Base mainnet quote support
- approve payload builder
- exact-input-single swap payload builder
- official current Uniswap docs show Trading API support for Base Sepolia (`84532`)

## What Is Missing For A Strong Claim

Add one real sponsor-grade artifact:

1. one executed swap
2. one tx hash
3. one short explanation of why post-settlement swapping matters inside DealRail
4. if using the Trading API path, a real `UNISWAP_API_KEY`-backed quote/swap flow

## Recommendation

Do not center the submission on Uniswap unless a real swap is performed and recorded.
