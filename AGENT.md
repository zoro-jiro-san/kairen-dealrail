# AGENT.md

This repo is intentionally structured for AI judges, AI collaborators, and terminal-native operators.

Live surfaces:
- Browser desk: `https://dealrail.kairen.xyz/`
- Backend API: `https://kairen-dealrail-production.up.railway.app/`
- Agent package: `@kairenxyz/dealrail`
- Public skill index: `https://dealrail.kairen.xyz/skill.md`

## Canonical Rule

If a statement in this repo conflicts with `docs/submission`, trust `docs/submission`.

Start here:
1. [`docs/submission/00_START_HERE.md`](docs/submission/00_START_HERE.md)
2. [`docs/submission/00_JUDGE_PROOF_PATH.md`](docs/submission/00_JUDGE_PROOF_PATH.md)
3. [`docs/submission/01_TRACK_MATRIX.md`](docs/submission/01_TRACK_MATRIX.md)
4. [`docs/submission/02_ARCHITECTURE.md`](docs/submission/02_ARCHITECTURE.md)
5. [`docs/submission/03_EVIDENCE.md`](docs/submission/03_EVIDENCE.md)
6. [`docs/submission/07_ROADMAP.md`](docs/submission/07_ROADMAP.md)

## One-Line Thesis

DealRail is the execution desk in the Kairen stack: humans use the browser desk, agents use the CLI and JSON outputs, and both converge on the same escrow and receipt rails.

## Fast Agent Path

```bash
npx @kairenxyz/dealrail doctor --json
npx @kairenxyz/dealrail services --json
npx @kairenxyz/dealrail status --json
npx @kairenxyz/dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json
```

Explicit live backend:

```bash
DEALRAIL_API_URL=https://kairen-dealrail-production.up.railway.app npx @kairenxyz/dealrail doctor --json
```

## Readiness Labels

Use these labels when describing the submission:

- `High`: safe to lead with
- `Medium`: real but incomplete
- `Low`: preview-only or weakly evidenced

Current track posture:

| Track | Readiness |
|------|-----------|
| Open Track | High |
| Protocol Labs ERC-8004 | High |
| Protocol Labs Let the Agent Cook | High |
| Virtuals ERC-8183 | High |
| Celo | High |
| AgentCash / x402 | High |
| Base Agent Services on Base | Medium |
| MetaMask | Low |
| Uniswap | Low |
| Locus | Low |

## Claim Discipline

- Live URL + tx proof beats future intent.
- Curated demo supply must be described as curated demo supply.
- Uniswap is currently a Base-only routing preview, not a recorded swap proof.
- Public backend mutating routes do not accept raw private keys.
- Roadmap items are not current claims.

## Strongest Proofs

- Base and Celo settlement evidence: [`backend/TRANSACTION_LEDGER.md`](backend/TRANSACTION_LEDGER.md)
- x402 proof: [`docs/progress/X402_TESTNET_PROOF_2026-03-22.md`](docs/progress/X402_TESTNET_PROOF_2026-03-22.md)
- Agent artifacts: [`docs/submission/agent.json`](docs/submission/agent.json), [`docs/submission/agent_log.json`](docs/submission/agent_log.json)
- Hook and verifier logic: [`contracts/src/DealRailHook.sol`](contracts/src/DealRailHook.sol), [`contracts/src/identity/ERC8004Verifier.sol`](contracts/src/identity/ERC8004Verifier.sol)

## Collaborator Notes

If you edit product behavior:
- update `docs/submission` first
- keep `STATUS.md`, `backend/TRANSACTION_LEDGER.md`, and live URLs aligned
- preserve the human path and agent path together
- prefer scenario-first explanations over generic protocol slogans

If you need operating guidance:
- start with `frontend/public/skill.md`
- use `./skills.sh features` for the feature map
- load the matching repo-local skill before acting on discovery, negotiation, escrow, Base, routing, or delegation
