# Winning Strategy

This is the prize strategy for maximizing win probability without overclaiming.

## Primary Objective

Win by looking credible, deep, and well-evidenced to both AI judges and humans.

In practice that means:
- fewer tracks
- stronger evidence
- load-bearing sponsor integrations
- clean narrative
- no inflated claims

## Best 3-Track Lock

If submitting right now, the best track combination is:

1. Synthesis Open Track
2. Protocol Labs: Agents With Receipts / ERC-8004
3. Celo: Best Agent on Celo

## Why This Set Wins

### Open Track

DealRail already matches three official themes well:
- agents that pay
- agents that trust
- agents that cooperate

That gives a broad but coherent story:
- pay: escrowed settlement rails
- trust: ERC-8004 verification and reputation
- cooperate: negotiated commitments and evaluator-mediated resolution

### Protocol Labs / ERC-8004

This is the cleanest sponsor fit because ERC-8004 changes behavior:
- discovery can enrich candidates with ERC-8004 data
- the hook can reject low-trust providers
- settlement can write feedback back into reputation infrastructure

This is better than a cosmetic integration because the trust rail is part of execution.

### Celo

Celo makes the project feel more real and less chain-local:
- real deployment exists
- stable-token settlement path exists
- both happy and reject flows are recorded

This gives the submission stronger breadth without diluting the core story.

## What To Avoid

Do not try to win by checking many sponsor boxes.

That loses with AI judges because they can detect:
- mock-only integrations
- non-load-bearing sponsor mentions
- vague problem statements
- inconsistent repo claims

## Submission Positioning

Use this hierarchy in the actual submission:

### Description

Lead with:
- DealRail is the trust and settlement layer for agent commerce
- agents can negotiate offchain, commit onchain, and settle only after verifiable completion
- ERC-8004 provides portable trust and reputation signals

### Problem Statement

Make it specific:
- agents can move money, but there is still no neutral execution layer for negotiated B2B work
- current agent payment rails are good at initiation, not at conditional settlement, disputes, or trustful counterparty selection

### Proof

Point judges to:
- Base Sepolia tx evidence
- Celo Sepolia tx evidence
- hook and verifier contracts
- passing contract tests

## Highest-ROI Remaining Work

If there is still time before final publish, do these in order:

1. Produce the final demo video around the Open + ERC-8004 + Celo narrative.
2. Add one honest `agent.json` and `agent_log.json` if you want to target Protocol Labs autonomy more aggressively.
3. Add one real MetaMask delegated transaction if you want a fourth track.
4. Add one real Uniswap settlement swap tx if you want a stronger finance angle.
5. Add one real Locus or AgentCash paid operation only if it becomes truly load-bearing in the demo.

## Best Chance To Win More Than One Prize

The most realistic multi-prize outcome comes from:
- Open Track for overall coherence
- Protocol Labs for trust infrastructure depth
- Celo for deployed cross-chain/stable-payment credibility

That trio is internally consistent and already evidenced.

## AI Judge Optimization Rules

AI judges will likely reward:
- exact file paths
- exact tx hashes
- exact deployment addresses
- explicit distinction between implemented and partial
- clear reading order

They will likely punish:
- inflated sponsor lists
- stale docs
- conflicting addresses
- unsupported “planned” claims framed as shipped

## Recommended Final Tone

The winning tone is:
- precise
- technical
- conservative on claims
- confident on evidence

Do not sound like a pitch deck.
Sound like a system that already works.
