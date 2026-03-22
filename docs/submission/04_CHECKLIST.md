# Submission Checklist

Use this to confirm that the submission story and repo state still match.

## Official Submission Basics

Derived from the Synthesis submission flow.

| Item | Status | Note |
|------|--------|------|
| Public repo | Done | This repo is public and judge-readable |
| Deployed product URL | Done | Frontend and backend are live |
| Description and problem statement | Ready | Use [`05_WINNING_STRATEGY.md`](05_WINNING_STRATEGY.md) |
| Conversation log | Required | Keep truthful in the submission payload |
| Submission metadata | Required | Must match the tools and files actually used |
| Video URL | Pending | Largest remaining publish blocker |

## Repo Readiness

| Item | Status | Evidence |
|------|--------|----------|
| Base Sepolia escrow proof | Done | [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md) |
| Celo happy path | Done | [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md) |
| Celo reject path | Done | [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md) |
| x402 paid-request proof | Done | [`docs/progress/X402_TESTNET_PROOF_2026-03-22.md`](../progress/X402_TESTNET_PROOF_2026-03-22.md) |
| Live browser desk | Done | `https://dealrail.kairen.xyz/` |
| Live backend | Done | `https://kairen-dealrail-production.up.railway.app/` |
| Live agent package | Done | `@kairenxyz/dealrail` |
| Agent artifacts | Done | [`agent.json`](agent.json), [`agent_log.json`](agent_log.json) |
| Safe public API boundary | Done | no raw private keys on public settlement routes |
| Judge-facing docs aligned | Done | `docs/submission`, `README.md`, `AGENT.md` |

## Track Checklist

| Track | Readiness | Current blocker | What to say |
|------|-----------|-----------------|-------------|
| Open Track | High | final demo packaging | lead with it |
| Protocol Labs ERC-8004 | High | optional stronger identity artifact | lead with it |
| Protocol Labs Let the Agent Cook | High | demo emphasis only | lead with it |
| Virtuals ERC-8183 | High | explanatory polish only | lead with it |
| Celo | High | demo emphasis only | lead with it |
| AgentCash / x402 | High | only one canonical proof so far | claim it as truthful testnet proof |
| Base Agent Services on Base | Medium | public Base directory is live, but open-market proof is still missing | mention the directory, not a fully open market |
| MetaMask | Low | no delegated tx | do not lead with it |
| Uniswap | Low | preview only, no swap proof | do not lead with it |
| Locus | Low | no live proof | do not lead with it |

## Final Checks Before Submission

1. Record the final demo video.
2. Keep the pitch centered on the High-readiness set.
3. Do not describe the curated demo market as a fully live open marketplace.
4. Do not describe Uniswap or MetaMask as stronger than preview/builder surfaces.
5. Keep the live URLs, tx hashes, and package name exact.
