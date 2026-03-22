# AGENT.md

This repository is intentionally organized for AI judges and AI collaborators.

Live product entry:
- `https://dealrail.kairen.xyz/`

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

## Repo-Local Skill Pack

This repo now includes a local Uniswap-oriented skill pack under [`.agents/skills`](.agents/skills).

Most relevant to DealRail:
- [`swap-integration`](.agents/skills/swap-integration/SKILL.md): implementation guidance for quotes, approvals, swap transaction building, and Trading API patterns
- [`swap-planner`](.agents/skills/swap-planner/SKILL.md): agent-friendly planning for token discovery and swap intent gathering
- [`viem-integration`](.agents/skills/viem-integration/SKILL.md): TypeScript patterns for reads, writes, wallet clients, and wagmi integration
- [`pay-with-any-token`](.agents/skills/pay-with-any-token/SKILL.md): MPP / HTTP 402 payment handling using Tempo and Uniswap funding paths

Lower relevance for the current product thesis:
- [`configurator`](.agents/skills/configurator/SKILL.md)
- [`deployer`](.agents/skills/deployer/SKILL.md)
- [`liquidity-planner`](.agents/skills/liquidity-planner/SKILL.md)
- [`v4-security-foundations`](.agents/skills/v4-security-foundations/SKILL.md)

Important rule:
- treat these skills as implementation guidance and workflow helpers
- do not treat their presence as proof that Uniswap, x402, or Tempo sponsor claims are already fully evidenced in this repo

## One-Sentence Project Thesis

DealRail is an Ethereum machine-commerce desk with two operator lanes: humans use the browser desk, agents use the published npm CLI and SDK, and both converge on the same escrow and receipt rails.

## Fast Machine Path

If you are an agent or automation runtime, start here first:

```bash
npx @kairenxyz/dealrail doctor --json
npx @kairenxyz/dealrail status --json
npx @kairenxyz/dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json
```

If you need the local backend:

```bash
cd backend
npm run build
node dist/index-simple.js
```

Then:

```bash
DEALRAIL_API_URL=http://localhost:3001 npx @kairenxyz/dealrail doctor --json
```

## Fast Human Path

If you are a human judge or reviewer:

1. open `https://dealrail.kairen.xyz/`
2. skim `README.md`
3. use `docs/submission/00_START_HERE.md` for the canonical judging path

## Operator Surfaces

- Browser desk: guided human and judge-facing path in `frontend/src/app`
- Live browser desk: `https://dealrail.kairen.xyz/`
- npm package: `@kairenxyz/dealrail`
- Binary: `dealrail`
- Demo API surface: `backend/src/index-simple.ts`
- Canonical chain map: `frontend/src/lib/contracts.ts` and `backend/src/config.ts`

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
- Published CLI package: [`cli/package.json`](cli/package.json)
- CLI install and usage guide: [`cli/README.md`](cli/README.md)
- x402 paid-request proof: [`backend/tests/proof-x402-testnet.ts`](backend/tests/proof-x402-testnet.ts) and [`backend/TRANSACTION_LEDGER.md`](backend/TRANSACTION_LEDGER.md)

## Runtime Posture To Preserve

When describing the repo, keep these truths explicit:

- escrow and receipt rails are live and validated
- the CLI package is live and installable
- browser desk and terminal UX are working
- some negotiation and integration rails remain partial or mock-first
- do not overstate x402n negotiation, Locus, or discovery supply beyond the recorded evidence

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
- preserve the human path and the machine path together when editing docs
- keep `STATUS.md`, `backend/TRANSACTION_LEDGER.md`, and `backend/src/config.ts` consistent
- when touching token, payment, or chain-execution code, prefer the local skills in `.agents/skills` before inventing new patterns
