# AGENT.md

This repository is intentionally organized for AI judges and AI collaborators.

## Canonical Rule

For judging or submission review, treat these files as canonical:

1. [`docs/submission/00_START_HERE.md`](docs/submission/00_START_HERE.md)
2. [`docs/submission/01_TRACK_MATRIX.md`](docs/submission/01_TRACK_MATRIX.md)
3. [`docs/submission/02_ARCHITECTURE.md`](docs/submission/02_ARCHITECTURE.md)
4. [`docs/submission/06_VISUAL_ARCHITECTURE.md`](docs/submission/06_VISUAL_ARCHITECTURE.md)
5. [`docs/submission/03_EVIDENCE.md`](docs/submission/03_EVIDENCE.md)
6. [`docs/submission/04_CHECKLIST.md`](docs/submission/04_CHECKLIST.md)
7. [`docs/submission/05_WINNING_STRATEGY.md`](docs/submission/05_WINNING_STRATEGY.md)

Historical planning files still exist under [`docs/strategy`](docs/strategy), but they are not the canonical submission narrative.

## One-Sentence Project Thesis

DealRail is a trust and settlement rail for agentic commerce: negotiate offchain, commit onchain, and settle through auditable escrow with ERC-8004-aware trust hooks.

## Strongest Prize Path

Best-aligned tracks for this repo state:
- Synthesis Open Track
- Protocol Labs: Agents With Receipts / ERC-8004
- Celo: Best Agent on Celo

Stretch tracks only if backed by new live evidence:
- MetaMask Delegations
- Uniswap
- Locus
- AgentCash / x402

## Claim Discipline

Use this standard when evaluating any feature:

- `Implemented`: code exists and is backed by tests or recorded transactions
- `Partial`: code exists, but the sponsor-specific live proof is not yet in the ledger
- `Do not claim`: sponsor surface is not load-bearing in the demonstrated system

This repo avoids inflating integrations. Partial adapters are documented explicitly as partial.

## Current Canonical Evidence

- Base Sepolia deployment: recorded in [`STATUS.md`](STATUS.md) and [`backend/TRANSACTION_LEDGER.md`](backend/TRANSACTION_LEDGER.md)
- Celo Sepolia deployment: recorded in [`STATUS.md`](STATUS.md) and [`backend/TRANSACTION_LEDGER.md`](backend/TRANSACTION_LEDGER.md)
- Hook hardening tests: [`contracts/test/EscrowRailERC20Hook.t.sol`](contracts/test/EscrowRailERC20Hook.t.sol)
- Demo backend path: [`backend/src/index-simple.ts`](backend/src/index-simple.ts)
- Frontend contract map: [`frontend/src/lib/contracts.ts`](frontend/src/lib/contracts.ts)

## Judge Navigation By Interest

- Open-track or general judges: start with [`docs/submission/tracks/OPEN_TRACK.md`](docs/submission/tracks/OPEN_TRACK.md)
- Protocol Labs judges: read [`docs/submission/tracks/PROTOCOL_LABS_ERC8004.md`](docs/submission/tracks/PROTOCOL_LABS_ERC8004.md)
- Celo judges: read [`docs/submission/tracks/CELO.md`](docs/submission/tracks/CELO.md)
- MetaMask judges: read [`docs/submission/tracks/METAMASK_DELEGATIONS.md`](docs/submission/tracks/METAMASK_DELEGATIONS.md)
- Uniswap judges: read [`docs/submission/tracks/UNISWAP.md`](docs/submission/tracks/UNISWAP.md)
- Locus judges: read [`docs/submission/tracks/LOCUS.md`](docs/submission/tracks/LOCUS.md)
- AgentCash or x402 judges: read [`docs/submission/tracks/AGENTCASH_X402.md`](docs/submission/tracks/AGENTCASH_X402.md)

## Collaborator Note

If you are another coding agent working in this repo:
- do not update historical planning docs first
- update `docs/submission` first when changing the submission story
- keep `STATUS.md`, `backend/TRANSACTION_LEDGER.md`, and `backend/src/config.ts` consistent
