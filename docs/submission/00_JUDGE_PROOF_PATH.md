# Judge Proof Path

Use this file if you want the shortest path from product claim to proof.

## Scenario A: Buyer agent needs a benchmark report

Claim:
- DealRail can turn buyer intent into a ranked provider shortlist and then into an escrow-backed workflow.

See:
1. [`README.md`](../../README.md)
2. [`docs/progress/DEMO_VALIDATION_2026-03-22.md`](../progress/DEMO_VALIDATION_2026-03-22.md)
3. [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md)

Why it matters:
- this is the clearest Open Track and Virtuals ERC-8183 story

## Scenario B: Human operator wants onchain settlement with trust hooks

Claim:
- Base Sepolia and Celo Sepolia jobs settle onchain, and ERC-8004-aware hooks are load-bearing.

See:
1. [`docs/submission/02_ARCHITECTURE.md`](02_ARCHITECTURE.md)
2. [`contracts/src/DealRailHook.sol`](../../contracts/src/DealRailHook.sol)
3. [`contracts/src/identity/ERC8004Verifier.sol`](../../contracts/src/identity/ERC8004Verifier.sol)
4. [`contracts/test/EscrowRailERC20Hook.t.sol`](../../contracts/test/EscrowRailERC20Hook.t.sol)

Why it matters:
- this is the strongest Protocol Labs ERC-8004 story

## Scenario C: Agent operator wants a live machine path

Claim:
- An agent can use the published CLI against the live backend and operate through a stable JSON surface.

See:
1. [`docs/submission/agent.json`](agent.json)
2. [`docs/submission/agent_log.json`](agent_log.json)
3. [`cli/package.json`](../../cli/package.json)
4. [`docs/progress/DEMO_VALIDATION_2026-03-22.md`](../progress/DEMO_VALIDATION_2026-03-22.md)

Why it matters:
- this is the strongest Let the Agent Cook story

## Scenario D: Agents that pay

Claim:
- DealRail has a real Base Sepolia x402 paid-request proof.

See:
1. [`docs/progress/X402_TESTNET_PROOF_2026-03-22.md`](../progress/X402_TESTNET_PROOF_2026-03-22.md)
2. [`backend/TRANSACTION_LEDGER.md`](../../backend/TRANSACTION_LEDGER.md)
3. [`docs/submission/tracks/AGENTCASH_X402.md`](tracks/AGENTCASH_X402.md)

Why it matters:
- this is the truthful x402 story

## What Not To Over-Read

- MetaMask is a builder/signing path, not a delegated tx proof yet.
- Uniswap is a Base-only routing preview, not a recorded swap proof.
- Locus is still low-confidence.
- Discovery is coherent, but it is not yet a fully public live market.
