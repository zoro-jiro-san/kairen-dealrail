# Start Here

This is the canonical submission entry point for DealRail.

## One-Line Thesis

DealRail is an Ethereum machine-commerce desk for humans and agents:
- request work
- compare providers
- pay instantly or commit to escrow
- settle with receipts
- score counterparties through ERC-8004-aware trust hooks

Live browser desk:
- `https://dealrail.kairen.xyz/`

Live backend API:
- `https://kairen-dealrail-production.up.railway.app/`

Published operator package:
- `@kairenxyz/dealrail`
- binary: `dealrail`

## Judge-Readiness Snapshot

These percentages are submission-readiness estimates, not code coverage.

| Track | Readiness | Meaning |
|------|-----------|---------|
| Synthesis Open Track | 95% | Primary narrative, evidence-backed |
| Protocol Labs: Agents With Receipts / ERC-8004 | 90% | Strongest sponsor-specific fit |
| Virtuals: ERC-8183 Open Build | 92% | Direct protocol-thesis fit |
| Celo: Best Agent on Celo | 90% | Real testnet deployment + proofs |
| AgentCash / x402 | 85% | Real paid-request proof on testnet |
| Protocol Labs: Let the Agent Cook | 70% | Good architecture fit, packaging gap remains |
| Base: Agent Services on Base | 75% | Good evidence, discoverability proof gap |
| MetaMask Delegations | 60% | Builder exists, execution proof missing |
| Uniswap | 55% | Builder exists, swap proof missing |
| Locus | 45% | Bridge exists, live proof missing |

## Fast Read Order

1. [`00_JUDGE_PROOF_PATH.md`](00_JUDGE_PROOF_PATH.md)
2. [`01_TRACK_MATRIX.md`](01_TRACK_MATRIX.md)
3. [`02_ARCHITECTURE.md`](02_ARCHITECTURE.md)
4. [`06_VISUAL_ARCHITECTURE.md`](06_VISUAL_ARCHITECTURE.md)
5. [`03_EVIDENCE.md`](03_EVIDENCE.md)
6. [`04_CHECKLIST.md`](04_CHECKLIST.md)
7. [`05_WINNING_STRATEGY.md`](05_WINNING_STRATEGY.md)
8. [`07_ROADMAP.md`](07_ROADMAP.md)
9. [`08_DEMO_SCRIPT.md`](08_DEMO_SCRIPT.md)

Track briefs:
- [`tracks/OPEN_TRACK.md`](tracks/OPEN_TRACK.md)
- [`tracks/PROTOCOL_LABS_ERC8004.md`](tracks/PROTOCOL_LABS_ERC8004.md)
- [`tracks/PROTOCOL_LABS_AGENT_COOK.md`](tracks/PROTOCOL_LABS_AGENT_COOK.md)
- [`tracks/CELO.md`](tracks/CELO.md)
- [`tracks/AGENTCASH_X402.md`](tracks/AGENTCASH_X402.md)

## Human And Agent Fast Path

Human evaluator:

```bash
npx @kairenxyz/dealrail doctor
npx @kairenxyz/dealrail help
```

Agent evaluator:

```bash
npx @kairenxyz/dealrail doctor --json
npx @kairenxyz/dealrail status --json
```

Live API check:

```bash
DEALRAIL_API_URL=https://kairen-dealrail-production.up.railway.app npx @kairenxyz/dealrail doctor --json
```

## Important Evaluation Rule

This pack is intentionally conservative.

- `85%+` means submit confidently.
- `70-84%` means valid stretch track with clear remaining work.
- below `70%` means code exists, but sponsor-grade proof is still missing.
- live URLs and tx hashes outrank planned integrations.
