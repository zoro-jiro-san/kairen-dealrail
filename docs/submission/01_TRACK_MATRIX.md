# Track Matrix

This matrix maps official Synthesis prize directions to the current DealRail repo state.

The percentages below are practical submission-readiness scores:
- `90-100%`: submit confidently
- `75-89%`: good stretch track if framed carefully
- `50-74%`: real implementation exists, but sponsor-grade proof is incomplete
- below `50%`: roadmap only

## Matrix

| Track | Readiness | Core claim | Files | Contract / Endpoint | Proof anchor | Main blocker | Fastest resolution |
|------|-----------|-----------|-------|---------------------|--------------|--------------|--------------------|
| Synthesis Open Track | 95% | DealRail is a real agent-commerce execution desk | `README.md`, `docs/submission/02_ARCHITECTURE.md`, `backend/src/index-simple.ts` | `EscrowRailERC20`, live frontend, live backend | Base + Celo ledger flows | Final demo packaging | Use the locked demo script and live URLs |
| Protocol Labs ERC-8004 | 90% | ERC-8004 affects execution, not just labeling | `contracts/src/identity/ERC8004Verifier.sol`, `contracts/src/DealRailHook.sol`, `contracts/test/EscrowRailERC20Hook.t.sol` | `ERC8004Verifier`, `DealRailHook` | Base/Celo deployments + hook tests | Needs one clearer operator-facing identity artifact | Add explicit identity lookup or registration artifact |
| Virtuals ERC-8183 | 92% | DealRail is already built around ERC-8183-style commerce flow | `contracts/src/EscrowRail.sol`, `contracts/src/EscrowRailERC20.sol`, `docs/submission/02_ARCHITECTURE.md` | escrow contracts | Base + Celo ledger flows | Mostly packaging | Keep protocol mapping explicit in final demo |
| Celo | 90% | Real utility exists on Celo rails | `contracts/script/DeployCeloSepolia.s.sol`, `backend/tests/test-lifecycle-celo-sepolia.ts` | Celo Sepolia contracts | Celo happy + reject txs | Mostly packaging | Show happy + reject paths clearly |
| AgentCash / x402 | 85% | DealRail can prove a real paid request | `backend/tests/proof-x402-testnet.ts`, `backend/src/services/x402.service.ts`, `backend/src/services/x402n.service.ts` | x402 paid-request path | `0x8dfabc6a77205b0740aa7bc48e230b7516acc76295536d18a6a30db19476940c` | Only one canonical paid proof | Add one more paid request if time allows |
| Protocol Labs Let the Agent Cook | 70% | Agents already have a real CLI/JSON path into the system | `cli/src/cli.ts`, `cli/src/types.ts`, `AGENT.md` | live backend + CLI | CLI runtime + existing onchain evidence | Missing `agent.json` and `agent_log.json` | Add truthful manifests and one structured autonomous run |
| Base Agent Services on Base | 75% | Base settlement and payment rails exist | `backend/src/index-simple.ts`, `backend/TRANSACTION_LEDGER.md` | Base Sepolia contracts + live backend | Base happy path + x402 proof | Discoverable public service proof is not canonical yet | Expose and log a public paid service |
| MetaMask Delegations | 60% | Delegation builder exists | `backend/src/services/delegation.service.ts`, `frontend/src/components/IntegrationsWorkbench.tsx` | delegation build endpoint | builder payloads only | No delegated tx hash | Execute one delegated tx and log it |
| Uniswap | 55% | Swap-building logic exists | `backend/src/services/uniswap.service.ts` | quote / tx builder path | no swap tx yet | No executed swap proof | Add `UNISWAP_API_KEY` and execute one swap |
| Locus | 45% | Bridge exists | `backend/src/services/locus.service.ts`, `backend/src/services/execution.service.ts` | Locus bridge endpoints | none live | No live proof | Only claim if a live run is captured |

## Recommended Lock

Primary:
1. Open Track
2. Protocol Labs ERC-8004
3. Virtuals ERC-8183
4. Celo
5. AgentCash / x402 on a testnet-only basis

Stretch:
6. Protocol Labs Let the Agent Cook
