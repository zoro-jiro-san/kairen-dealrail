# Protocol Labs: ERC-8004

## Why This Is A Strong Fit

This is the strongest sponsor-specific fit in the repo.

ERC-8004 is not decorative here:
- provider identity can be resolved through the registry
- provider reputation can be read before key actions
- post-settlement feedback can be written back through the hook

## Core Files

- [`contracts/src/identity/ERC8004Verifier.sol`](../../../contracts/src/identity/ERC8004Verifier.sol)
- [`contracts/src/DealRailHook.sol`](../../../contracts/src/DealRailHook.sol)
- [`backend/src/services/discovery.service.ts`](../../../backend/src/services/discovery.service.ts)
- [`contracts/test/EscrowRailERC20Hook.t.sol`](../../../contracts/test/EscrowRailERC20Hook.t.sol)

## Strongest Claim

DealRail turns ERC-8004 into execution-layer trust:
- not just identity display
- not just profile lookup
- actual settlement-linked trust behavior

## Evidence To Cite

- Canonical Base and Celo deployment addresses in [`STATUS.md`](../../../STATUS.md)
- Hook hardening tests in [`contracts/test/EscrowRailERC20Hook.t.sol`](../../../contracts/test/EscrowRailERC20Hook.t.sol)
- Onchain settlement evidence in [`backend/TRANSACTION_LEDGER.md`](../../../backend/TRANSACTION_LEDGER.md)

## Best Pitch

Agents need receipts and trust signals that survive platform boundaries.
DealRail uses ERC-8004 registries to gate, score, and update counterparties around real economic activity.

## Current Limitation

The repo strongly supports the ERC-8004 track.
If the team also wants to push for “Let the Agent Cook,” it should add honest autonomy-packaging artifacts such as `agent.json` and `agent_log.json`.
