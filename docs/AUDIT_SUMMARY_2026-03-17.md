# DealRail Contract Audit Summary (2026-03-17)

Scope:
- `contracts/src/EscrowRail.sol`
- `contracts/src/EscrowRailERC20.sol`
- `contracts/src/DealRailHook.sol`
- `contracts/src/identity/ERC8004Verifier.sol`
- Interfaces and hook wiring behavior

Method:
- Manual logic/security review
- State-machine and role-auth review
- Hook-liveness and trust-loop review
- Foundry test suite run with added hook-focused cases

## Findings and Resolution

### 1) Hook logic stored but not executed (Critical)
Risk:
- Reputation/delegation gates and post-settlement trust writes were not enforced at runtime.

Resolution:
- Added `beforeAction` and `afterAction` invocation paths in both escrow contracts.
- Relevant files:
  - `contracts/src/EscrowRail.sol`
  - `contracts/src/EscrowRailERC20.sol`

Status: Fixed.

### 2) Trust gate fail-open in `DealRailHook` pre-fund (High)
Risk:
- If provider was unregistered or reputation lookup failed, fund could still proceed.

Resolution:
- Changed to fail-closed:
  - Revert on missing provider registration when threshold enabled.
  - Revert on reputation lookup failure.
- Relevant file:
  - `contracts/src/DealRailHook.sol`

Status: Fixed.

### 3) Post-settlement reputation write soft-fail (Medium)
Risk:
- Settlement could succeed while trust updates silently failed.

Resolution:
- Made after-action strict:
  - Hook feedback write failure now reverts, preserving atomic trust guarantees.
- Relevant files:
  - `contracts/src/DealRailHook.sol`
  - `contracts/src/EscrowRail.sol`
  - `contracts/src/EscrowRailERC20.sol`

Status: Fixed.

### 4) Missing job existence checks (Medium)
Risk:
- Non-existent job IDs could hit edge paths (especially on refund/open-state defaults).

Resolution:
- Added `job not found` guards to mutating functions across both escrow variants.

Status: Fixed.

### 5) ERC20 escrow accepted stray ETH value (Low)
Risk:
- Callers could accidentally send ETH to ERC20 fund path.

Resolution:
- Added `require(msg.value == 0)` in ERC20 `fund`.

Status: Fixed.

### 6) Hook address could be EOA (Low)
Risk:
- Misconfiguration could bypass intended hook behavior.

Resolution:
- Added hook contract code-size check in `createJob` when hook is non-zero.

Status: Fixed.

## Test Evidence
- Command: `forge test -vvv`
- Result: `22 passed, 0 failed`
- Added suite:
  - `contracts/test/EscrowRailERC20Hook.t.sol`
  - Covers hook-blocking behavior, missing-job reverts, and hook contract validation

## Residual Risks / Notes
- Strict post-action mode prioritizes trust integrity over liveness. If external reputation registry is unavailable, completion/rejection via hooked jobs can be blocked until registry recovers (refund path remains available by expiry).
- Owner-controlled verifier and threshold parameters remain a governance trust assumption.

## Recommendation
- Keep strict mode for hackathon/demo credibility (strong trust guarantees).
- If production liveness pressure increases, introduce an explicit governance-controlled hook mode switch (`strict` vs `best-effort`) with transparent eventing.
