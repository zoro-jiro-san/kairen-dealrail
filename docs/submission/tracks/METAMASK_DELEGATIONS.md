# MetaMask Delegations

## Current Status

Partial.

The repo includes a real delegation payload builder, but not canonical proof of live delegated execution.

## Core File

- [`backend/src/services/delegation.service.ts`](../../../backend/src/services/delegation.service.ts)

## What Exists

The builder supports:
- scoped target restriction
- allowed method restriction
- ERC-20 amount cap
- expiry caveat

That means the authorization model is coherent and aligned with the sponsor ask.

## What Is Missing For A Strong Claim

To claim this track strongly, add:

1. one signed delegation artifact
2. one transaction executed under delegation
3. one tx hash recorded in the ledger

## Recommendation

Only add this track if a real delegated flow is recorded before final publish.
