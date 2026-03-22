# Evidence

This file points judges to the strongest proof artifacts in the repository.

## Canonical Deployment Sources

- [`STATUS.md`](../../STATUS.md)
- [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md)
- [`backend/src/config.ts`](../../backend/src/config.ts)
- [`frontend/src/lib/contracts.ts`](../../frontend/src/lib/contracts.ts)

## Final Canonical Addresses

### Base Sepolia
- NullVerifier: `0xA61a57fF5570bF989a3a565B87b6421413995317`
- ERC8004Verifier: `0xDB23657606957B32B385eC0A917d2818156668AC`
- EscrowRail: `0x8c55C2BB6A396D3654f214726230D81e6fa22b69`
- EscrowRailERC20: `0xE25B10057556e9714d2ac60992b68f4E61481cF9`
- DealRailHook: `0x5fA109A74a688a49D254a21C2F3ab238E2A7F62e`

### Celo Sepolia
- NullVerifier: `0x8728dDDD3c1D7B901c62E9D6a232F17462a931E2`
- ERC8004Verifier: `0x2700e5B26909301967DFeECE9cb931B9bA3bA2df`
- EscrowRail: `0x684D32E03642870B88134A3722B0b094666EF42e`
- EscrowRailERC20: `0xB9dfa53326016415ca6fb9eb16A0f050c8d15C74`
- DealRailHook: `0x04B0D16f790A5F83dc48c7e4D05467ff2eA57519`

## Best Transaction Proofs

### Base Sepolia

Canonical run recorded in [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md):
- createJob: `0xc88a6bcef436cad6fefb0e012bf7ccf57ea991905f6b22615287701692952430`
- approve: `0xae617b8867bb6739bf13e9aedde6045ebd8d8e49690f02175ffedb4b8abfb02d`
- fund: `0xb0de61acee165e1e86a587edec2f8ab4c89a3ceae9e101d23a012b31ef9f66e5`
- submit: `0x7ceaed4c8f145be9978289f0eea39cab4f92aa8417a33d1a06a98e8243de7f88`
- complete: `0xfe06fa5f1c85d2c33f2c78c5d38fc03a2ab72628c292d3378830cd591f4cc519`

### Celo Sepolia Happy Path

Canonical run recorded in [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md):
- createJob: `0x5424798f49767904187831f74c1aff76ca173f05cf24522e49e10f206a1813e5`
- approve: `0xcf465c9617badda28db452e0ca18201429c908231855d03035acf98200cae8ee`
- fund: `0x16603b8ae114379ccb440b931c1e59e5f06037fe66b461b2cd588bb133627a1d`
- submit: `0x0512fc165fce20db039dc202f551d894ba51c260a9ff71cb0829ac1a9fda0f19`
- complete: `0x33a7fbf3c45f9c12a43c59c344d7ae1aaaf3e0928cd157c3dd63feb0d737ce24`

### Celo Sepolia Reject Path

Canonical run recorded in [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md):
- createJob: `0x772b595b728a565098a0d68567792dbff2bb71c3a524427c896ab440c7a9f3f1`
- approve: `0xf93ad09eb4168d47010ba881fca673cfa7965ec65d3c8f4273b07fd1b86a1453`
- fund: `0xe04dfcbb499a3b3f2252e5b840adbc034071e11fe3bb62cc0103653f3944c017`
- submit: `0xdb6dc84e97d4f2f39e3f5008786dff0fb3908a753d95b7c6017fc3890238235a`
- reject: `0xb94efcdcfc41f7e3da223b9068e649797a575039d4e2e15b71b9beb19e31efb3`

## Test Evidence

Canonical test references:
- [`contracts/test/EscrowRail.t.sol`](../../contracts/test/EscrowRail.t.sol)
- [`contracts/test/EscrowRailERC20Hook.t.sol`](../../contracts/test/EscrowRailERC20Hook.t.sol)
- [`backend/tests/test-lifecycle.ts`](../../backend/tests/test-lifecycle.ts)
- [`backend/tests/test-lifecycle-celo-sepolia.ts`](../../backend/tests/test-lifecycle-celo-sepolia.ts)

Reported status in [`STATUS.md`](../../STATUS.md):
- `forge test -vvv`: 22/22 passing

## Strongest Trust Evidence

The best ERC-8004-related evidence lives in:
- [`contracts/src/identity/ERC8004Verifier.sol`](../../contracts/src/identity/ERC8004Verifier.sol)
- [`contracts/src/DealRailHook.sol`](../../contracts/src/DealRailHook.sol)
- [`contracts/test/EscrowRailERC20Hook.t.sol`](../../contracts/test/EscrowRailERC20Hook.t.sol)

This is strong because ERC-8004 affects behavior, not just labeling:
- provider trust can gate actions
- reputation reads influence acceptance criteria
- reputation writes happen after successful settlement

## Partial Evidence Zones

These integrations are coded but not yet evidenced with sponsor-specific live artifacts in the canonical ledger:
- MetaMask delegation execution
- Uniswap swaps
- Locus live calls
- AgentCash or paid x402 requests

Those should be treated as partial until new proof is recorded.
