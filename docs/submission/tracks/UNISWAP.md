# Uniswap

## Current Status

Partial.

The repo contains real quote and transaction-building logic, but the canonical ledger does not yet include a Uniswap swap tx.

## Core File

- [`backend/src/services/uniswap.service.ts`](../../../backend/src/services/uniswap.service.ts)

## What Exists

- Base mainnet quote support
- approve payload builder
- exact-input-single swap payload builder

## What Is Missing For A Strong Claim

Add one real sponsor-grade artifact:

1. one executed swap
2. one tx hash
3. one short explanation of why post-settlement swapping matters inside DealRail

## Recommendation

Do not center the submission on Uniswap unless a real swap is performed and recorded.
