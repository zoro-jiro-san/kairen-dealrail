# Submission Checklist

This checklist combines official submission requirements with repo-state verification.

## Official Submission Requirements

Derived from `https://synthesis.devfolio.co/submission/skill.md`.

| Item | Status | Evidence / Note |
|------|--------|-----------------|
| Registered participant identity | User-stated | User indicated registration is already done; not independently verified in repo |
| Self-custody transfer complete for publish | User-stated | Required by official submission flow; confirm in submission dashboard before publish |
| Team exists | User-stated | Official flow says a team is auto-created at registration |
| At least one track selected | Ready | Track strategy documented in [`01_TRACK_MATRIX.md`](01_TRACK_MATRIX.md) |
| Public repo | Done | This GitHub repo is submission-ready |
| Description and problem statement | Ready to finalize | Use [`05_WINNING_STRATEGY.md`](05_WINNING_STRATEGY.md) to tighten wording |
| Conversation log | Required | Must be truthful and complete in submission payload |
| Submission metadata | Required | Must accurately list tools, skills, resources actually used |
| Deployed URL | Optional but recommended | Frontend/backend should be linked if publicly reachable |
| Video URL | Pending | This remains one of the main final blockers |

## Repo Readiness

| Item | Status | Evidence |
|------|--------|----------|
| Canonical deployment addresses aligned | Done | [`STATUS.md`](../../STATUS.md), [`backend/src/config.ts`](../../backend/src/config.ts), [`frontend/src/lib/contracts.ts`](../../frontend/src/lib/contracts.ts) |
| Base Sepolia onchain evidence | Done | [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md) |
| Celo Sepolia onchain evidence | Done | [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md) |
| Happy path demonstrated | Done | Base and Celo tx hashes recorded |
| Reject path demonstrated | Done | Celo reject flow recorded |
| Contract hardening tests | Done | [`contracts/test/EscrowRailERC20Hook.t.sol`](../../contracts/test/EscrowRailERC20Hook.t.sol) |
| AI-judge-friendly docs | Done | `docs/submission` |
| Root docs consistent with canonical deployment set | Done | Root README, AGENT, docs index updated |

## Prize Readiness

| Track | Status | Notes |
|-------|--------|-------|
| Open Track | Ready | Use as primary narrative |
| Protocol Labs ERC-8004 | Ready | Strongest sponsor-specific angle |
| Celo | Ready | Strong third track |
| MetaMask | Not ready for strong claim | Needs one real delegated tx |
| Uniswap | Not ready for strong claim | Needs one real swap tx |
| Locus | Not ready for strong claim | Needs one live Locus proof |
| AgentCash / x402 | Not ready for strong claim | Needs one real paid request |

## Final Remaining Blockers

1. Publish or link the final demo video.
2. Confirm self-custody transfer status in the submission system.
3. Submit only the tracks supported by actual evidence unless new proof is recorded.
4. If claiming Protocol Labs autonomy beyond ERC-8004, prepare honest `agent.json` and `agent_log.json` artifacts first.

## Recommended Final Track Lock

Lock these unless new sponsor-specific evidence is added:

1. Synthesis Open Track
2. Protocol Labs: Agents With Receipts / ERC-8004
3. Celo: Best Agent on Celo
