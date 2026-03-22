# Start Here

This is the canonical submission entry point for DealRail.

## Thesis

DealRail is an Ethereum machine-commerce desk for humans and agents:
- define intent
- scan provider supply
- rank offers
- pay instantly or commit to escrow
- settle through an evaluator
- leave receipts and trust signals behind

Live surfaces:
- Browser desk: `https://dealrail.kairen.xyz/`
- Backend API: `https://kairen-dealrail-production.up.railway.app/`
- Agent package: `@kairenxyz/dealrail`

## Readiness Snapshot

| Track | Readiness | Meaning |
|------|-----------|---------|
| Synthesis Open Track | High | Primary narrative and evidence-backed |
| Protocol Labs: Agents With Receipts / ERC-8004 | High | Strongest sponsor-specific fit |
| Protocol Labs: Let the Agent Cook | High | Live agent path plus canonical agent artifacts |
| Virtuals: ERC-8183 Open Build | High | Direct product-thesis fit |
| Celo: Best Agent on Celo | High | Real deployment and proofs |
| AgentCash / x402 | High | Real paid-request proof on testnet |
| Base: Agent Services on Base | Medium | Good fit, but not yet a fully live open market |
| MetaMask Delegations | Low | Payload builder only |
| Uniswap | Low | Base-only preview, no swap proof |
| Locus | Low | Adapter exists, proof weak |

## Three Ways To Understand The Product

### 1. Human operator story

Open the browser desk, inspect live jobs, and sign directly from the wallet that belongs on that job’s chain.

### 2. Agent operator story

Run:

```bash
npx @kairenxyz/dealrail doctor --json
npx @kairenxyz/dealrail status --json
npx @kairenxyz/dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json
```

### 3. Judge story

Follow:

1. [`00_JUDGE_PROOF_PATH.md`](00_JUDGE_PROOF_PATH.md)
2. [`01_TRACK_MATRIX.md`](01_TRACK_MATRIX.md)
3. [`02_ARCHITECTURE.md`](02_ARCHITECTURE.md)
4. [`03_EVIDENCE.md`](03_EVIDENCE.md)

## What Makes This Repo Strong

- real Base Sepolia and Celo Sepolia escrow flows
- real x402 paid-request proof on Base Sepolia
- ERC-8004-aware trust hooks that affect behavior
- live frontend, live backend, live npm package
- safe public API boundary
- scenario-first docs for both agents and humans

## Important Truths

- DealRail is strongest today as a real escrow-and-receipts product.
- Discovery and negotiation are coherent, but still curated demo supply in mock mode.
- The public backend does not ask users to send raw private keys.
- Uniswap is currently a Base-only post-settlement preview path.

## Read Order

1. [`00_JUDGE_PROOF_PATH.md`](00_JUDGE_PROOF_PATH.md)
2. [`01_TRACK_MATRIX.md`](01_TRACK_MATRIX.md)
3. [`02_ARCHITECTURE.md`](02_ARCHITECTURE.md)
4. [`03_EVIDENCE.md`](03_EVIDENCE.md)
5. [`04_CHECKLIST.md`](04_CHECKLIST.md)
6. [`05_WINNING_STRATEGY.md`](05_WINNING_STRATEGY.md)
7. [`06_VISUAL_ARCHITECTURE.md`](06_VISUAL_ARCHITECTURE.md)
8. [`07_ROADMAP.md`](07_ROADMAP.md)
