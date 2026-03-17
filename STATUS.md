# DealRail Status

Last updated: 2026-03-17 (UTC)

## Current Build Status
- Contracts: audited pass (source-level), compiled, and smoke-tested on Base Sepolia + Celo Sepolia
- Backend: healthy for lifecycle + negotiation flow; Celo smoke path passing
- Frontend: simplified IA shipped (Home / Flow / Ops / Integrations) with terminal-style shell
- Docs: README + transaction ledger updated; formal audit summary added

## Security Hardening Completed
- Hook execution is now wired in both escrow contracts (before/after action callbacks are actually invoked)
- Hook address validation added (`hook` must be a contract if non-zero)
- Job existence checks added across mutating methods (`job not found` guard)
- ERC20 fund hardening added (`msg.value == 0` required)
- Fail-open trust behavior removed in `DealRailHook`:
  - Unregistered provider now reverts when min reputation is enabled
  - Reputation lookup failure now reverts
- Post-settlement reputation write is strict (reverts if write fails), so trust updates are atomic with settlement

## Test Status
- `forge test -vvv`: 22/22 passing
- Added dedicated hook-focused ERC20 tests:
  - before-hook can block fund
  - after-hook can block complete and preserve state
  - missing-job reverts
  - hook-address-is-contract guard

## Final Active Testnet Addresses
- Base Sepolia:
  - NullVerifier: `0xA61a57fF5570bF989a3a565B87b6421413995317`
  - ERC8004Verifier: `0xDB23657606957B32B385eC0A917d2818156668AC`
  - EscrowRail (ETH): `0x8c55C2BB6A396D3654f214726230D81e6fa22b69`
  - EscrowRailERC20 (USDC): `0xE25B10057556e9714d2ac60992b68f4E61481cF9`
  - DealRailHook: `0x5fA109A74a688a49D254a21C2F3ab238E2A7F62e`
- Celo Sepolia:
  - NullVerifier: `0x8728dDDD3c1D7B901c62E9D6a232F17462a931E2`
  - ERC8004Verifier: `0x2700e5B26909301967DFeECE9cb931B9bA3bA2df`
  - EscrowRail (CELO): `0x684D32E03642870B88134A3722B0b094666EF42e`
  - EscrowRailERC20 (stable): `0xB9dfa53326016415ca6fb9eb16A0f050c8d15C74`
  - DealRailHook: `0x04B0D16f790A5F83dc48c7e4D05467ff2eA57519`

## Next Execution Plan
1. Lock final deployment set (no more iterative redeploys unless a new security bug is found).
2. Complete Base Mainnet ERC-8004 registrations for buyer/provider/evaluator.
3. Record final demo video (happy path + reject/refund path) with explorer proofs.
4. Submission polish (README narrative + track mapping + architecture visual).
