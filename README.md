# Kairen DealRail

DealRail is an Ethereum-first machine-commerce execution desk for agent-to-agent and human-assisted service deals.
It combines market competition, machine payments, onchain escrow, evaluator-mediated settlement, and ERC-8004 reputation hooks.

Humans can operate it from the browser desk.
Agents can operate it from the published npm package and stable JSON CLI mode.

Live browser desk:
- `https://dealrail.kairen.xyz/`

Published package:
- `@kairenxyz/dealrail`
- current verified npm release in this repo: `0.1.1`

Hackathon context:
- Event: The Synthesis
- Submission deadline: March 22, 2026 at 11:59 PM PST
- Judging model: AI agents plus humans

## AI Judge Fast Path

If you are evaluating this repository, read these files in order:

1. [`docs/submission/00_START_HERE.md`](docs/submission/00_START_HERE.md)
2. [`docs/submission/01_TRACK_MATRIX.md`](docs/submission/01_TRACK_MATRIX.md)
3. [`docs/submission/02_ARCHITECTURE.md`](docs/submission/02_ARCHITECTURE.md)
4. [`docs/submission/06_VISUAL_ARCHITECTURE.md`](docs/submission/06_VISUAL_ARCHITECTURE.md)
5. [`docs/submission/03_EVIDENCE.md`](docs/submission/03_EVIDENCE.md)
6. [`docs/submission/04_CHECKLIST.md`](docs/submission/04_CHECKLIST.md)
7. [`docs/submission/05_WINNING_STRATEGY.md`](docs/submission/05_WINNING_STRATEGY.md)

Track-specific briefs:
- [`docs/submission/tracks/OPEN_TRACK.md`](docs/submission/tracks/OPEN_TRACK.md)
- [`docs/submission/tracks/PROTOCOL_LABS_ERC8004.md`](docs/submission/tracks/PROTOCOL_LABS_ERC8004.md)
- [`docs/submission/tracks/CELO.md`](docs/submission/tracks/CELO.md)
- [`docs/submission/tracks/METAMASK_DELEGATIONS.md`](docs/submission/tracks/METAMASK_DELEGATIONS.md)
- [`docs/submission/tracks/UNISWAP.md`](docs/submission/tracks/UNISWAP.md)
- [`docs/submission/tracks/LOCUS.md`](docs/submission/tracks/LOCUS.md)
- [`docs/submission/tracks/AGENTCASH_X402.md`](docs/submission/tracks/AGENTCASH_X402.md)

## Start In 60 Seconds

### Human Operator

Open the live browser desk first:
- `https://dealrail.kairen.xyz/`

Or use the source routes:
- home overview: [`frontend/src/app/page.tsx`](frontend/src/app/page.tsx)
- terminal desk: [`frontend/src/app/terminal/page.tsx`](frontend/src/app/terminal/page.tsx)
- docs desk: [`frontend/src/app/docs/page.tsx`](frontend/src/app/docs/page.tsx)

Or use the terminal package:

```bash
npx @kairenxyz/dealrail help
npx @kairenxyz/dealrail doctor
npx @kairenxyz/dealrail vend "automation benchmark report" --budget 0.12 --hours 24
```

### Agent Runtime

Use the same package in JSON mode:

```bash
npx @kairenxyz/dealrail doctor --json
npx @kairenxyz/dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json
```

### Backend Integrator

Run the demo-grade API:

```bash
cd backend
npm run build
node dist/index-simple.js
```

Then point the CLI at it:

```bash
DEALRAIL_API_URL=http://localhost:3001 npx @kairenxyz/dealrail doctor --json
```

## Operator Surfaces

DealRail now has three first-class entry surfaces:

| Surface | Audience | Why it exists |
|---------|----------|---------------|
| Browser desk | Humans, judges, mixed operator teams | Explains the product, shows the terminal UX, and gives the fastest evaluation path |
| npm CLI package | Agents and terminal-native humans | Gives a stable command surface, `--json` mode, and a lightweight install story |
| Backend API | Integrators and automation | Exposes negotiation, discovery, machine-payment, delegation, and escrow lifecycle endpoints |

The published package is:
- package: `@kairenxyz/dealrail`
- binary: `dealrail`
- SDK entry: `import { DealRailClient } from '@kairenxyz/dealrail'`

## Local Agent Skills

The repo also includes a local skill pack under [`.agents/skills`](.agents/skills) for agent collaborators and AI judges inspecting implementation patterns.

Most relevant skills:
- [`viem-integration`](.agents/skills/viem-integration/SKILL.md): EVM reads, writes, wallet clients, and wagmi patterns
- [`swap-integration`](.agents/skills/swap-integration/SKILL.md): Uniswap quote, approval, and swap integration patterns
- [`swap-planner`](.agents/skills/swap-planner/SKILL.md): swap planning and token discovery workflows
- [`pay-with-any-token`](.agents/skills/pay-with-any-token/SKILL.md): HTTP 402 / machine-payment handling with Tempo and Uniswap funding paths

These skills are part of the repo's agent UX, not evidence. They improve how future agents navigate and extend the project, but they do not upgrade sponsor-track claims unless backed by recorded transactions in the ledger.

## What Is Real Today

### Contracts
- ERC-8183-style escrow lifecycle is implemented in [`contracts/src/EscrowRail.sol`](contracts/src/EscrowRail.sol) and [`contracts/src/EscrowRailERC20.sol`](contracts/src/EscrowRailERC20.sol)
- ERC-8004 identity and reputation integration is implemented in [`contracts/src/identity/ERC8004Verifier.sol`](contracts/src/identity/ERC8004Verifier.sol) and [`contracts/src/DealRailHook.sol`](contracts/src/DealRailHook.sol)
- Hook safety tests exist in [`contracts/test/EscrowRailERC20Hook.t.sol`](contracts/test/EscrowRailERC20Hook.t.sol)

### Deployments
- Base Sepolia and Celo Sepolia canonical addresses are recorded in [`STATUS.md`](STATUS.md) and [`backend/TRANSACTION_LEDGER.md`](backend/TRANSACTION_LEDGER.md)
- Backend defaults now point to the March 17, 2026 canonical deployment set in [`backend/src/config.ts`](backend/src/config.ts)

### Backend
- Live job lifecycle API exists in [`backend/src/index-simple.ts`](backend/src/index-simple.ts)
- Negotiation bridge, discovery, execution adapters, delegation builder, Uniswap payload builder, and Locus bridge are implemented in [`backend/src/services`](backend/src/services)

### Frontend
- Next.js operator UI exists in [`frontend/src/app`](frontend/src/app)
- live deployment exists at `https://dealrail.kairen.xyz/`
- Canonical contract addresses for frontend reads/writes are in [`frontend/src/lib/contracts.ts`](frontend/src/lib/contracts.ts)
- Browser demo terminal and operator docs exist in [`frontend/src/app/terminal/page.tsx`](frontend/src/app/terminal/page.tsx) and [`frontend/src/app/docs/page.tsx`](frontend/src/app/docs/page.tsx)

### CLI / SDK
- Published npm package exists at `@kairenxyz/dealrail`
- Human-readable CLI lives in [`cli/src/cli.ts`](cli/src/cli.ts)
- Stable agent JSON shapes live in [`cli/src/types.ts`](cli/src/types.ts)
- Recordable walkthrough lives in [`cli/demo/dealrail-demo.sh`](cli/demo/dealrail-demo.sh)

### Evidence
- Canonical smoke-test transactions are recorded in [`backend/TRANSACTION_LEDGER.md`](backend/TRANSACTION_LEDGER.md)
- Current build status and deployment set are summarized in [`STATUS.md`](STATUS.md)

## Track Coverage Summary

This repo intentionally separates strong claims from partial claims.

| Track | Status | Claim Level |
|-------|--------|-------------|
| Synthesis Open Track | End-to-end product with real testnet evidence | Strong |
| Protocol Labs: Agents With Receipts / ERC-8004 | Implemented and evidenced onchain hooks + verifier | Strong |
| Celo: Best Agent on Celo | Deployed and smoke-tested on Celo Sepolia | Strong |
| MetaMask: Best Use of Delegations | Delegation payload builder implemented, live delegated execution not evidenced | Partial |
| Uniswap: Agentic Finance | Quote + transaction builders implemented, no swap tx evidence in ledger | Partial |
| Locus: Best Use of Locus | Bridge implemented, mock-first by default, live evidence not included | Partial |
| Merit / AgentCash / x402 | Real Base Sepolia paid-request proof now exists in the ledger, alongside the x402-first adapter surface | Strong on testnet |
| Bankr, Venice, ENS, Slice, Status, Self, Arkhai, others | Not submission targets in current repo state | Do not claim |

Full matrix:
- [`docs/submission/01_TRACK_MATRIX.md`](docs/submission/01_TRACK_MATRIX.md)

## Architecture In One Pass

1. A buyer defines constraints and requests offers through the market competition bridge.
2. Candidate providers are ranked and enriched with ERC-8004 trust data when available.
3. The desk chooses machine payment for immediate calls or commits the selected deal onchain through the ERC-8183 escrow contract.
4. Funds are locked in escrow until the provider submits a deliverable.
5. An evaluator completes or rejects the job.
6. DealRailHook can enforce trust gates before actions and write ERC-8004 reputation after settlement.
7. Optional execution adapters prepare downstream operations such as Uniswap, Locus, and delegation payloads.

The same loop has two operator entry paths:

```text
human -> browser desk -> backend -> machine payment or escrow -> receipt
agent -> npm cli / sdk -> backend -> machine payment or escrow -> receipt
```

Canonical architecture doc:
- [`docs/submission/02_ARCHITECTURE.md`](docs/submission/02_ARCHITECTURE.md)

## Canonical Deployments

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

## Repository Map

- [`AGENT.md`](AGENT.md): AI-judge and collaborator navigation
- [`docs/submission`](docs/submission): canonical submission pack
- [`docs/strategy`](docs/strategy): planning and historical track strategy
- [`cli`](cli): published npm CLI and lightweight SDK surface
- [`contracts`](contracts): Solidity contracts and tests
- [`backend`](backend): Express API, integrations, smoke tests, ledger
- [`frontend`](frontend): Next.js UI
- [`skills`](skills): role-based operational prompts for agents

## Submission Readiness

Ready:
- Base Sepolia happy-path evidence
- Celo Sepolia happy-path and reject-path evidence
- ERC-8004 verifier and reputation hook integration
- Hook hardening tests and canonical deployment ledger
- AI-agent-friendly submission docs in `docs/submission`

Still pending:
- final demo video packaging
- any sponsor-track claim that requires live third-party API execution beyond the evidence already recorded
- any additional evidence needed to move partial integrations into the strong-claim set

## Local Verification

Root commands:

```bash
npm run check
npm run build
npm run test:contracts
```

Package-local commands:

Contracts:

```bash
cd contracts
forge test -vvv
```

Backend:

```bash
cd backend
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run type-check
npm run build
```

CLI:

```bash
cd cli
npm run check
npm run build
npx @kairenxyz/dealrail help
```

Live API preflight:

```bash
DEALRAIL_API_URL=http://localhost:3001 npx @kairenxyz/dealrail doctor --json
```

## Honest Runtime Posture

This repo is working, but it is still disciplined about what is live and what is mock-first.

Live and verified:
- npm package install and CLI command surface
- browser desk, docs desk, and demo terminal
- backend lifecycle API
- Base Sepolia and Celo Sepolia escrow flows
- ERC-8004 hook and verifier integration

Present but still mock-first or partial:
- competition layer posture
- provider discovery supply
- Locus live payout proof in the ledger
- Uniswap swap execution proof in the ledger

## Important Claim Discipline

This repository is submission-oriented, not marketing-oriented.

- If a feature has onchain evidence or passing tests, we say it is implemented.
- If a feature only prepares payloads or runs in mock mode by default, we label it partial.
- If sponsor infrastructure is not load-bearing in the demonstrated path, we do not claim that track as a strong submission target.
