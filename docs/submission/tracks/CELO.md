# Celo

## Why This Is A Strong Fit

DealRail is actually deployed and tested on Celo Sepolia.

That matters because the Celo story is not hypothetical:
- stable-token settlement path exists
- happy path exists
- reject path exists
- tx hashes are recorded

## Core Files

- [`contracts/script/DeployCeloSepolia.s.sol`](../../../contracts/script/DeployCeloSepolia.s.sol)
- [`backend/tests/test-lifecycle-celo-sepolia.ts`](../../../backend/tests/test-lifecycle-celo-sepolia.ts)
- [`backend/TRANSACTION_LEDGER.md`](../../../backend/TRANSACTION_LEDGER.md)
- [`frontend/src/lib/contracts.ts`](../../../frontend/src/lib/contracts.ts)

## Best Evidence

Use the canonical Celo section of:
- [`backend/TRANSACTION_LEDGER.md`](../../../backend/TRANSACTION_LEDGER.md)

Especially:
- happy path tx sequence
- reject path tx sequence
- final Celo deployment addresses

## Best Pitch

Celo is the right settlement rail for frequent agent deals because the system wants stable-value, low-friction execution.

## What To Avoid

- do not describe Celo support as a future deployment
- do not mix old Alfajores planning docs with the final Celo Sepolia evidence
