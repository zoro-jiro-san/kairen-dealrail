# DealRail Status

Last updated: 2026-03-22 (UTC)

## Product Status

- Frontend: live at `https://dealrail.kairen.xyz/`
- CLI package: published as `@kairenxyz/dealrail`
- Contracts: canonical testnet deployment set active on Base Sepolia and Celo Sepolia
- Backend: chain-aware demo API and lifecycle surface are in place
- Docs: root and submission docs aligned to the current architecture

## What Is Working

### Browser and UX
- browser desk is live on Cloudflare Workers
- terminal demo mode works without wallet connection
- wallet connection remains available as an optional step for real operator flows

### CLI and agent path
- `npx @kairenxyz/dealrail help`
- `npx @kairenxyz/dealrail doctor`
- `npx @kairenxyz/dealrail vend ...`
- `--json` mode is the stable agent path

### Chain and settlement posture
- Base Sepolia supported
- Celo Sepolia supported
- stablecoin-oriented settlement path supported
- job simulation endpoint available in backend

## Truthful Runtime Posture

### Strong and evidenced
- escrow lifecycle contracts
- ERC-8004 verifier and hook integration
- Base Sepolia happy path
- Celo Sepolia happy path
- Celo Sepolia reject path
- x402 Base Sepolia paid-request proof
- published CLI distribution
- live frontend deployment

### Implemented but still partial
- provider discovery depth
- multi-round negotiation supply
- Uniswap post-settlement swap proof
- Locus live payout path
- delegated execution beyond payload preparation

## Current Canonical Testnet Addresses

### Base Sepolia
- NullVerifier: `0xA61a57fF5570bF989a3a565B87b6421413995317`
- ERC8004Verifier: `0xDB23657606957B32B385eC0A917d2818156668AC`
- EscrowRail (native): `0x8c55C2BB6A396D3654f214726230D81e6fa22b69`
- EscrowRailERC20: `0xE25B10057556e9714d2ac60992b68f4E61481cF9`
- DealRailHook: `0x5fA109A74a688a49D254a21C2F3ab238E2A7F62e`

### Celo Sepolia
- NullVerifier: `0x8728dDDD3c1D7B901c62E9D6a232F17462a931E2`
- ERC8004Verifier: `0x2700e5B26909301967DFeECE9cb931B9bA3bA2df`
- EscrowRail (native): `0x684D32E03642870B88134A3722B0b094666EF42e`
- EscrowRailERC20: `0xB9dfa53326016415ca6fb9eb16A0f050c8d15C74`
- DealRailHook: `0x04B0D16f790A5F83dc48c7e4D05467ff2eA57519`

## Canonical Entry Points

### Human
- browser desk: `https://dealrail.kairen.xyz/`
- browser terminal: `/terminal`
- docs desk: `/docs`

### Agent
```bash
npx @kairenxyz/dealrail doctor --json
npx @kairenxyz/dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json
```

### Backend
- canonical server: `backend/src/index-simple.ts`
- chain-aware service layer: `backend/src/services/contract.service.ts`

## Verification Snapshot

Most recent verified repo checks:
- root `npm run check`
- backend `npm test`
- frontend `npm run lint`
- frontend `npm run type-check`
- frontend `npm run build`
- frontend `npm run build:worker`
- cli `npm run check`
- cli `npm run build`

## Canonical Evidence Sources

- `backend/TRANSACTION_LEDGER.md`
- `docs/progress/DEMO_VALIDATION_2026-03-22.md`
- `docs/submission/03_EVIDENCE.md`

## Next Product Priorities

1. tighten any remaining outdated docs outside the canonical set
2. continue simplifying human and agent UX around the same command flow
3. expand live evidence only where integrations move beyond mock-first posture
