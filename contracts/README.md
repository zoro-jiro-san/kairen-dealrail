# DealRail Contracts

This package contains the onchain settlement and trust layer for DealRail.

## Core Contracts

- [`src/EscrowRail.sol`](src/EscrowRail.sol): native-token escrow lifecycle
- [`src/EscrowRailERC20.sol`](src/EscrowRailERC20.sol): ERC-20 escrow lifecycle used for the canonical demo path
- [`src/DealRailHook.sol`](src/DealRailHook.sol): before/after action hook with ERC-8004-aware trust logic
- [`src/identity/ERC8004Verifier.sol`](src/identity/ERC8004Verifier.sol): ERC-8004 registry-backed identity verifier
- [`src/identity/NullVerifier.sol`](src/identity/NullVerifier.sol): test-friendly no-op verifier

## Why This Matters For Judging

The contract package contains the strongest sponsor-specific depth in the project:
- escrow settlement is real
- hook execution is real
- ERC-8004 integration is behavioral, not decorative

## Tests

Important tests:
- [`test/EscrowRail.t.sol`](test/EscrowRail.t.sol)
- [`test/EscrowRailERC20Hook.t.sol`](test/EscrowRailERC20Hook.t.sol)

Key hardening coverage includes:
- missing-job guards
- hook address validation
- before-hook blocking
- after-hook blocking with state preservation

## Commands

```bash
forge build
forge test -vvv
forge fmt
```

## Deployment Scripts

- [`script/DeployBaseSepolia.s.sol`](script/DeployBaseSepolia.s.sol)
- [`script/DeployCeloSepolia.s.sol`](script/DeployCeloSepolia.s.sol)
- [`script/DeployCeloAlfajores.s.sol`](script/DeployCeloAlfajores.s.sol)

Canonical deployment references live in:
- [`../STATUS.md`](../STATUS.md)
- [`../backend/TRANSACTION_LEDGER.md`](../backend/TRANSACTION_LEDGER.md)
