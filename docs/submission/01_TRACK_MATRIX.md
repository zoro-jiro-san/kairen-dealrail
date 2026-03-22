# Track Matrix

This matrix maps the live Synthesis prize set to the current DealRail repo state.

## Readiness Labels

- `High`: safe to submit around and emphasize
- `Medium`: real implementation exists, but sponsor-grade proof is incomplete
- `Low`: preview-only, under-evidenced, or roadmap-grade

## Recommended Track Lock

Primary set:
1. Synthesis Open Track
2. Protocol Labs: Agents With Receipts / ERC-8004
3. Protocol Labs: Let the Agent Cook
4. Virtuals: ERC-8183 Open Build
5. Celo: Best Agent on Celo
6. AgentCash / x402 on a testnet-only basis

Keep secondary:
- Base: Agent Services on Base

Keep out of the main pitch:
- MetaMask Delegations
- Uniswap
- Locus
- MoonPay / EigenCloud / others not load-bearing in the current product

## Matrix

| Sponsor / Track | Readiness | What judges want | Current repo coverage | Main blocker | Next truthful step |
|-----------------|-----------|------------------|----------------------|--------------|--------------------|
| Synthesis Open Track | High | Coherent product, real value, solid proof | Browser desk, CLI, backend, contracts, multi-chain evidence | final demo packaging only | record one concise live walkthrough |
| Protocol Labs: Agents With Receipts / ERC-8004 | High | Identity, trust, receipts, reputation | Verifier, hook, trust-aware discovery, settlement writes, tests | could use a tighter identity artifact in the demo pack | include one registry lookup or trust-loop callout |
| Protocol Labs: Let the Agent Cook | High | Honest autonomy story, structured artifacts, reproducible run | live package, live backend path, `--json`, `agent.json`, `agent_log.json` | strongest gap is demo emphasis, not code | make the CLI run visible in final video |
| Virtuals: ERC-8183 Open Build | High | Real commerce rail and clean protocol mapping | Escrow-backed commerce loop is the product core | mostly packaging | keep ERC-8183 mapping explicit |
| Celo: Best Agent on Celo | High | Real utility on Celo rails | Celo Sepolia happy and reject proofs are recorded | none beyond packaging | include Celo in final demo |
| AgentCash / x402 | High | Real machine payment proof | Base Sepolia paid-request proof plus x402 adapter surface | only one canonical proof so far | add another proof only if it is quick |
| Base: Agent Services on Base | Medium | Paid service discoverability on Base | Base Sepolia evidence exists and discovery is coherent | provider market is still curated in mock mode | wire public market-backed supply or a public paid endpoint |
| MetaMask Delegations | Low | Real delegated authorization and execution | payload builder and typed-data signing path | no delegated tx hash | add a real delegated tx or keep low |
| Uniswap | Low | Real API-backed swap depth and tx proof | Base-only routing preview exists | no recorded swap tx and no sponsor-grade proof | add a real swap proof or keep low |
| Locus | Low | Locus must be load-bearing and live | adapter exists | no canonical live proof | keep as roadmap unless a real run lands |

## Why This Lock Is Defensible

- It matches what is actually live.
- It maps directly to the strongest evidence artifacts.
- It avoids claiming a fully live open marketplace when the current system is still curated in mock mode.
- It turns the new autonomy packaging into a real strength instead of leaving it as a gap.
