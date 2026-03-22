# DealRail Backend

This package contains the API and integration layer for DealRail.

## Canonical Submission Path

For the hackathon demo and judging flow, the canonical server is:

```bash
npm run dev:simple
```

That starts [`src/index-simple.ts`](src/index-simple.ts), which:
- reads job state directly from chain
- exposes escrow lifecycle endpoints
- exposes negotiation, discovery, delegation, Uniswap, Locus, and x402-related adapters
- avoids requiring a database for the main demo path

## Important Files

- [`src/index-simple.ts`](src/index-simple.ts): canonical demo API surface
- [`src/config.ts`](src/config.ts): canonical network and contract configuration
- [`src/services/contract.service.ts`](src/services/contract.service.ts): onchain lifecycle calls
- [`src/services/x402n.service.ts`](src/services/x402n.service.ts): negotiation flow
- [`src/services/discovery.service.ts`](src/services/discovery.service.ts): provider discovery and ERC-8004 enrichment
- [`src/services/delegation.service.ts`](src/services/delegation.service.ts): ERC-7710 delegation payload builder
- [`src/services/uniswap.service.ts`](src/services/uniswap.service.ts): quote and tx builders
- [`src/services/locus.service.ts`](src/services/locus.service.ts): Locus bridge
- [`TRANSACTION_LEDGER.md`](TRANSACTION_LEDGER.md): canonical demo evidence

## Current Canonical Networks

### Base Sepolia
- EscrowRailERC20: `0xE25B10057556e9714d2ac60992b68f4E61481cF9`
- DealRailHook: `0x5fA109A74a688a49D254a21C2F3ab238E2A7F62e`
- ERC8004Verifier: `0xDB23657606957B32B385eC0A917d2818156668AC`

### Celo Sepolia
- EscrowRailERC20: `0xB9dfa53326016415ca6fb9eb16A0f050c8d15C74`
- DealRailHook: `0x04B0D16f790A5F83dc48c7e4D05467ff2eA57519`
- ERC8004Verifier: `0x2700e5B26909301967DFeECE9cb931B9bA3bA2df`

## Commands

```bash
npm run dev:simple
npm run build
npm run smoke:celo-sepolia
```

## Notes On Partial Integrations

These backend surfaces exist, but should only be claimed strongly if live proof is recorded:
- MetaMask delegated execution
- Uniswap swaps
- Locus live calls
- AgentCash or x402 paid requests
- Bankr live execution

## Evidence

Use these files when judging or verifying claims:
- [`../docs/submission/03_EVIDENCE.md`](../docs/submission/03_EVIDENCE.md)
- [`TRANSACTION_LEDGER.md`](TRANSACTION_LEDGER.md)
- [`../STATUS.md`](../STATUS.md)
