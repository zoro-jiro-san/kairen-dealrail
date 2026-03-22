# Kairen DealRail

DealRail is an agentic commerce execution rail for machine-to-machine deals.
It combines offchain negotiation, onchain escrow, evaluator-mediated settlement, and ERC-8004 reputation hooks.

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
- Canonical contract addresses for frontend reads/writes are in [`frontend/src/lib/contracts.ts`](frontend/src/lib/contracts.ts)

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
| Merit / AgentCash / x402 | x402 and x402n surfaces exist, no live paid x402 proof captured here | Partial |
| Bankr, Venice, ENS, Slice, Status, Self, Arkhai, others | Not submission targets in current repo state | Do not claim |

Full matrix:
- [`docs/submission/01_TRACK_MATRIX.md`](docs/submission/01_TRACK_MATRIX.md)

## Architecture In One Pass

1. A buyer defines constraints and requests offers through the x402n negotiation bridge.
2. Candidate providers are ranked and enriched with ERC-8004 trust data when available.
3. A selected deal is committed onchain through the ERC-8183 escrow contract.
4. Funds are locked in escrow until the provider submits a deliverable.
5. An evaluator completes or rejects the job.
6. DealRailHook can enforce trust gates before actions and write ERC-8004 reputation after settlement.
7. Optional execution adapters prepare downstream operations such as Uniswap, Locus, and delegation payloads.

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
- Base Mainnet ERC-8004 registrations for buyer, provider, evaluator
- Final demo video
- Any sponsor-track claim that requires live third-party API execution beyond the evidence already recorded

## Local Verification

Contracts:

```bash
cd contracts
forge test -vvv
```

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

## Important Claim Discipline

This repository is submission-oriented, not marketing-oriented.

- If a feature has onchain evidence or passing tests, we say it is implemented.
- If a feature only prepares payloads or runs in mock mode by default, we label it partial.
- If sponsor infrastructure is not load-bearing in the demonstrated path, we do not claim that track as a strong submission target.
