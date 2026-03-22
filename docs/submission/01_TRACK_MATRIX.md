# Track Matrix

This matrix maps official Synthesis prize directions to the current DealRail repo state.

## Priority Summary

Submit with confidence:
- Open Track
- Protocol Labs: Agents With Receipts / ERC-8004
- Celo

Submit only if new proof is added:
- MetaMask Delegations
- Uniswap
- Locus

Do not center the submission on:
- Bankr
- Venice
- ENS
- Slice
- Status
- Self
- Arkhai
- other sponsors not load-bearing in the demonstrated path

## Matrix

| Sponsor / Track | What Judges Want | Current Repo Coverage | Evidence In Repo | Claim Level | Win Advice |
|-----------------|------------------|----------------------|------------------|-------------|-----------|
| Synthesis Open Track | Clear agent system, real utility, coherent multi-theme fit | Full product narrative exists across negotiation, trust, escrow, and settlement | Base + Celo tx ledger, tests, architecture docs | Strong | Make this the main story |
| Protocol Labs: Agents With Receipts / ERC-8004 | Onchain identity, reputation, trust, receipts | ERC8004 verifier, hook gates, post-settlement feedback writes, discovery enrichment | Contracts, tests, deployments, tx ledger | Strong | This is the best sponsor-specific fit |
| Protocol Labs: Let the Agent Cook | Full autonomous loop, agent manifest, agent log, tool use | Multi-step flow exists, but manifest/log packaging is not yet canonical in repo | Partial documentation only | Conditional | Only add if `agent.json` and `agent_log.json` are prepared truthfully |
| Celo: Best Agent on Celo | Real utility using Celo payment rails | Celo Sepolia deployment and smoke tests for happy and reject paths | Canonical tx hashes in ledger | Strong | Best third track today |
| MetaMask: Best Use of Delegations | Real delegated authorization patterns | ERC-7710 payload builder exists | Builder code only, no delegated tx proof | Partial | Needs one real delegated funding or settlement flow |
| Uniswap: Agentic Finance | Real swaps and tx ids | Quote and tx builder endpoints exist | No swap tx ids recorded in ledger | Partial | Needs one real post-settlement swap tx |
| Locus: Best Use of Locus | Locus must be core and working | Live/mock bridge exists, mock mode default | No live Locus payment proof recorded | Partial | Only worth adding if live operation is captured |
| Merit / AgentCash / x402 | Paid x402 requests are core | x402 proxy, x402n bridge, and real Base Sepolia paid-request proof exist | Base Sepolia x402 settlement tx recorded in ledger | Strong on testnet | Valid stretch track if framed around testnet-paid proof |
| Bankr | Real execution via Bankr gateway | Bankr service and neutral adapter scaffold exist | No confirmed live Bankr flow | Do not claim strongly | Mention only as future extension if asked |
| Venice | Private cognition plus public action | No privacy-preserving compute integration | None | Do not claim | Exclude |
| ENS | ENS as primary identity/communication layer | No canonical ENS implementation in active flow | None | Do not claim | Exclude |
| Slice / Status / Self / Arkhai / others | Sponsor-specific load-bearing use | Not core to current demo path | None | Do not claim | Exclude |

## Why The Top 3 Are Best

### 1. Open Track
- Most forgiving of architecture breadth if the demo is coherent
- DealRail spans three official themes well: pay, trust, cooperate
- The repo has enough real evidence to support the broad thesis

### 2. Protocol Labs: ERC-8004
- The trust layer is not cosmetic
- ERC-8004 shapes provider verification, hook gating, and post-settlement reputation
- This is the cleanest sponsor-to-product fit

### 3. Celo
- The project is actually deployed on Celo Sepolia
- The ledger contains both happy and reject flows
- Celo helps differentiate the project from a Base-only story

## Highest-ROI Stretch Upgrades

If there is time before publish, the best stretch upgrades are:

1. Add one real delegated MetaMask flow and tx hash
2. Add one real Uniswap post-settlement swap tx hash
3. Add one real Locus paid operation
4. Package an honest `agent.json` and `agent_log.json` for Protocol Labs autonomy track
