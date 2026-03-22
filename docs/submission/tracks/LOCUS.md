# Locus

## Current Status

Partial.

The bridge exists, but the default mode is mock-first and the canonical evidence pack does not include a live Locus payment artifact.

## Core Files

- [`backend/src/services/locus.service.ts`](../../../backend/src/services/locus.service.ts)
- [`backend/src/services/execution.service.ts`](../../../backend/src/services/execution.service.ts)

## What Exists

- tool listing path
- send-USDC bridge path
- live-call support when API key is present
- mock fallback for deterministic demos

## What Is Missing For A Strong Claim

To claim Locus strongly, add:

1. one live Locus operation
2. one operation id or tx-linked proof
3. one explanation of why Locus is core rather than optional

## Recommendation

Keep Locus as a documented extension unless live proof is added.
