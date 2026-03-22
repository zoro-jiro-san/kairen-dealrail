# DealRail Status

Last updated: 2026-03-22 UTC

## Live Product

- Frontend: `https://dealrail.kairen.xyz/`
- Backend: `https://kairen-dealrail-production.up.railway.app/`
- CLI package: `@kairenxyz/dealrail`
- Canonical chains: Base Sepolia and Celo Sepolia

## Capability Status

| Capability | Readiness | Note |
|-----------|-----------|------|
| Browser desk | High | Live and judge-ready |
| CLI / agent path | High | Published package, `--json`, live backend |
| Backend API | High | Live, chain-aware, safe public boundary |
| Base Sepolia escrow flow | High | Canonical testnet proof exists |
| Celo Sepolia escrow flow | High | Happy and reject proofs exist |
| ERC-8004 trust hooks | High | Verifier, hook, tests, deployments |
| x402 paid-request proof | High | Real Base Sepolia proof exists |
| Discovery / competition | Medium | Coherent and truthful, but curated demo supply in mock mode |
| Base services discoverability | Medium | Real path exists, but not a fully live open market |
| MetaMask delegation execution | Low | Builder and signing path only |
| Uniswap routing | Low | Base-only preview, no recorded swap tx |
| Locus | Low | Adapter exists, proof not canonical |

## Track Status

| Track | Readiness | Current blocker |
|------|-----------|-----------------|
| Open Track | High | final demo packaging only |
| Protocol Labs ERC-8004 | High | add one tighter identity lookup artifact if helpful |
| Protocol Labs Let the Agent Cook | High | final video/demo can emphasize it more |
| Virtuals ERC-8183 | High | mostly packaging, not code |
| Celo | High | better demo emphasis only |
| AgentCash / x402 | High | only one canonical paid proof so far |
| Base Agent Services on Base | Medium | discovery is curated, not fully public-market backed |
| MetaMask | Low | no delegated tx proof |
| Uniswap | Low | no swap tx proof |
| Locus | Low | no live proof |

## Current Canonical Addresses

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

## Verification Snapshot

Most recent repo checks:
- root `npm run check`
- root `npm run build`
- backend `npm test`
- frontend `npm run lint`
- frontend `npm run type-check`
- frontend `npm run build`

## Canonical Evidence

- [`backend/TRANSACTION_LEDGER.md`](backend/TRANSACTION_LEDGER.md)
- [`docs/progress/DEMO_VALIDATION_2026-03-22.md`](docs/progress/DEMO_VALIDATION_2026-03-22.md)
- [`docs/progress/X402_TESTNET_PROOF_2026-03-22.md`](docs/progress/X402_TESTNET_PROOF_2026-03-22.md)
- [`docs/submission/agent.json`](docs/submission/agent.json)
- [`docs/submission/agent_log.json`](docs/submission/agent_log.json)

## Product Boundary

Important current truth:
- public backend settlement routes use managed demo signers only
- human and non-demo operators should sign from wallets, not send keys to the server
- discovery and negotiation are aligned, but still curated when mock mode is on
- Uniswap is a Base-only post-settlement preview path
