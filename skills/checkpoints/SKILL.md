---
name: checkpoints
description: Use for final run validation and demo readiness across negotiation, escrow lifecycle, and transaction evidence.
---

# Deal Checkpoints

## Use When
- Preparing demo runs and submission evidence.

## Checkpoints
1. Preflight:
   - Wallets funded and role-mapped.
   - Chain + contracts verified.
2. Negotiation:
   - RFO created and offers ranked.
   - Offer accepted and confirmed.
3. Escrow:
   - createJob -> fund -> submit succeed.
4. Decision:
   - complete or reject executed once.
   - terminal state verified onchain.
5. Evidence:
   - tx hashes + explorer links captured in ledger.

## Exit Criteria
- Happy and reject paths both succeed.
- Ledger file updated.
- README/PRD references current deployed artifacts.
