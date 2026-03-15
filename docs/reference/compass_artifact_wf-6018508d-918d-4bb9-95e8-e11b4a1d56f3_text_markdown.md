# Winning Synthesis with Kairen DealRail

**Kairen DealRail is positioned to exploit the single largest gap in the agent commerce stack: payment coordination.** The x402 protocol has processed $600M+ in irreversible push payments with zero escrow, zero negotiation, and zero recourse. DealRail — a machine-native deal execution rail with offchain negotiation, onchain escrow, and evaluator-verified settlement — is exactly what judges, sponsors, and the market need right now. Better still, the Ethereum Foundation shipped ERC-8183 (Agentic Commerce Protocol) on February 25, 2026 — a standard that is functionally identical to what DealRail does, meaning the project can claim it implements an emerging EF-backed standard rather than inventing from scratch. This report provides the complete tactical playbook: hackathon rules, all sponsor tracks ranked by fit, the technical integration stack, competitive intelligence, and a demo strategy designed to maximize prize capture across up to 10 tracks.

---

## The hackathon runs March 13–22 with AI judges

**Synthesis** is the first hackathon where AI agents judge submissions alongside humans. Co-organized by the Ethereum Foundation's dev acc and dAI teams, powered by Devfolio and Bonfires, it runs fully online with a **10-day building window (March 13–22, 2026)** and winners announced March 25. The total prize pool is **$50K–$100K+** across an open track and 26+ sponsor bounties.

The judging system is novel. Each sponsor trains their own **AI agent judge** that evaluates submissions according to sponsor-specific criteria. Mid-hackathon (March 18), these AI judges provide feedback on in-progress projects — a rare opportunity to course-correct before final submission. The open track synthesizes scores from all agent judges, weighted toward the four core themes.

**Four themes define the scoring axes:**

- **Agents that Pay** — Transparent, verifiable agent spending with scoped permissions
- **Agents that Trust** — Decentralized identity and trust without centralized registries
- **Agents that Cooperate** — Smart contract enforcement of agent agreements and promises
- **Agents that Keep Secrets** — Privacy-preserving agent operations protecting human metadata

DealRail maps directly to three of four themes (Pay, Trust, Cooperate), giving it unusually strong thematic alignment for the open track. The fourth theme (Keep Secrets) could be addressed through encrypted negotiation terms stored offchain.

**Submission requirements** follow standard Devfolio format: project description, GitHub repository with visible commit history (large single commits risk disqualification), demo video (2–4 minutes), and selection of sponsor tracks. Both humans and AI agents can register, compete, and win.

---

## ERC-8183 is the core technical primitive — implement it

The single most important technical finding from this research is **ERC-8183 (Agentic Commerce Protocol)**, a Draft ERC created February 25, 2026 by Davide Crapis (Ethereum Foundation dAI team lead) and Bryan Lim, Tay Weixiong, and Chooi Zuhwa from Virtuals Protocol. It defines precisely the pattern DealRail needs: a **Job primitive with escrowed budget, four active states, and an evaluator role** that gates settlement on delivery verification.

The state machine flows: **Open → Funded → Submitted → Completed/Rejected/Expired**. A client creates a job specifying a provider, an evaluator, and an expiry timestamp. Both client and provider can call `setBudget()` to negotiate price while the job is Open. The client calls `fund()` to lock ERC-20 tokens into escrow. The provider submits work as a `bytes32` deliverable hash. Only the evaluator can call `complete()` (releasing escrow to provider minus optional fees) or `reject()` (refunding client). After expiry, anyone can call `claimRefund()` — deliberately unhookable for safety.

**The hooks system is where DealRail differentiates.** ERC-8183 supports optional `IACPHook` contracts with `beforeAction()` and `afterAction()` callbacks on every core function except refund. This enables:

- **Pre-fund gates**: Require minimum ERC-8004 reputation scores before allowing escrow funding
- **Post-complete reputation writes**: Automatically update ERC-8004 Reputation Registry after settlement
- **Bidding mechanisms**: Verify offchain signed bids during provider selection
- **Custom fee logic**: Implement DealRail-specific settlement splits

The reference implementation uses UUPS upgradeable proxies, OpenZeppelin AccessControl, and ReentrancyGuardTransient. A ThoughtProof multi-model evaluator is already deployed on Base Mainnet at `0x119299F33f918808edD5ef92bd79cefB8700C091`, validating that the pattern works in production. The Virtuals repo (`Virtual-Protocol/agent-commerce-protocol`) has the full Solidity under MIT license.

**Critical integration note**: ERC-8183's spec says both client and provider can call `setBudget()`, but the reference implementation restricts it to provider-only. For DealRail's negotiation use case, you should modify the implementation to allow both parties, matching the spec's intent.

---

## Targeting 10 sponsor tracks with a layered architecture

The key to maximizing prize capture is designing an architecture where each sponsor integration addresses a distinct layer of the stack. Here are the **top 10 tracks ranked by strategic fit**, with specific integration guidance for each.

**Tier 1 — Highest alignment, highest expected value:**

**1. Celo ($10,000 confirmed).** Deploy the DealRail escrow contract on Celo with cUSD as the settlement token. Celo's mobile-first L1 and sub-cent transaction fees make it ideal for real-world agent commerce. The hackathon organizer (sodofi) is Celo's DevRel Engineering Lead — this is almost certainly a priority partner. Use Alfajores testnet for development, demonstrate mobile agent interactions via MiniPay.

**2. MetaMask (estimated $5–10K).** Integrate the **MetaMask Delegation Toolkit** (ERC-7710/7715) to create scoped agent permissions. A human delegates escrow-funding authority to their agent with caveats: spending caps, approved counterparties, time limits, and token whitelists. This is the "human-defined policy bounds" layer. Use caveat enforcers for rule-based permission gating. Starter repos exist at `github.com/MetaMask/gator-nextjs-starter`.

**3. Locus (estimated $1–3K but perfect fit).** Locus is literally "secure USDC payments with escrow, spending limits, and policy enforcement" for AI agents. Their MCP endpoint at `mcp.paywithlocus.com/mcp` provides the payment infrastructure. Build DealRail's payment layer directly on Locus MCP, using their smart wallet architecture for per-agent API keys and audit trails. This is low-effort, high-signal integration.

**4. Lit Protocol (estimated $5–10K).** Use **Vincent** (Lit's agent wallet framework) for the escrow agent's key management. Lit Actions — immutable JavaScript programs running in TEEs — can enforce escrow release conditions programmatically. PKPs (Programmable Key Pairs) create escrow wallets that physically cannot release funds except under verified conditions. V1 mainnet (Naga) is live since December 2025.

**Tier 2 — Strong alignment, meaningful differentiation:**

**5. Olas/Valory (estimated $5–15K combined).** Build DealRail as an **Olas autonomous service** with multiple agent components (negotiator, escrow holder, settlement executor). Register on the Olas Registry for discoverability. Must include at least one skill, one agent, one service per Olas bounty requirements. The Mech Marketplace integration lets DealRail agents be hired by other agents.

**6. Base (estimated $5–10K).** Deploy on Base as the primary settlement chain. Use **CDP Wallet** for programmatic agent wallets, **x402** for HTTP-native payment discovery, and **AgentKit** for onchain agent actions. Base has the largest L2 DeFi TVL (**$4.7B, 46% of all L2 DeFi**) and is Coinbase's home chain. Show transactions on Base Sepolia testnet with links to the explorer.

**7. Uniswap (estimated $5–10K).** Build a **Uniswap v4 hook** that integrates with the escrow settlement flow — when a deal completes, the hook can automatically swap the escrowed token into the provider's preferred denomination via a Uniswap pool. This is "programmable settlement" and demonstrates v4 hook innovation. UniswapX intents could also represent conditional deal execution.

**Tier 3 — Valuable additions, lower effort:**

**8. Self.xyz (estimated $2–5K).** Add zero-knowledge identity verification as a pre-fund gate. Before escrow is funded, the hook calls Self's verification contract to confirm the counterparty's Agent ID (backed by passport-scanned ZK proofs). This addresses the "Agents that Trust" theme directly. Uses `@selfxyz/contracts` SDK on Celo Sepolia.

**9. ENS (estimated $2–5K).** Give each DealRail agent an ENS name (e.g., `escrow-agent.kairen.eth`). Implement ENSIP-25 to link ENS names to ERC-8004 agent registry entries. Use ENS text records for agent metadata, capabilities, and DealRail endpoints. This makes agent discovery human-readable and decentralized.

**10. Slice (estimated $1–3K).** Use Slice's onchain commerce protocol for deal storefronts — agents can publish available services as Slice storefronts with automated payment splitting via Slicers. Leverage **ERC-8128** (Slice's standard for signing/verifying HTTP requests with Ethereum accounts) for agent authentication in commerce flows.

**Integration architecture diagram:**

| Layer | Technology | Sponsor Track |
|-------|-----------|---------------|
| Human Authorization | ERC-7710 delegation with caveats | MetaMask |
| Agent Identity | ERC-8004 registry + ENS names + Self.xyz ZK-KYC | ENS, Self |
| Discovery | Olas Registry + Slice storefronts + skill.md | Olas, Slice |
| Negotiation | x402n offchain protocol within policy bounds | Base (x402) |
| Escrow | ERC-8183 Job contract with hooks on Celo + Base | Celo, Base |
| Key Management | Lit Protocol Vincent + PKPs | Lit Protocol |
| Settlement | ERC-20 transfer + Uniswap v4 hook swap | Uniswap |
| Payment Interface | Locus MCP for USDC operations | Locus |
| Intelligence | Bankr LLM Gateway for negotiation agent | Bankr |
| Reputation | ERC-8004 post-settlement hooks | Open Track |

---

## The competitive meta favors trust infrastructure

Analysis of **50+ winning projects** across ETHGlobal Agentic Ethereum, Bangkok, Buenos Aires, NYC, and the Cronos x402 PayTech hackathon reveals clear patterns. **x402 is the dominant payment rail** — multiple Buenos Aires and Cronos winners built on it. **Multi-agent collaboration consistently wins** (Industry AI, Hubble Trading Arena, Rogue swarm). **Trust/escrow primitives are the emerging frontier** — OathLock won with escrow + attestations, AgentFabric won Cronos ($24K) with "programmable permissions," and Cronos Shield placed with risk management for agent transactions.

The critical insight: **payment initiation is solved; payment coordination is not.** RebelFi's analysis states it directly: "Every major agentic payments protocol launched in 2025 solves payment initiation. None of them solves payment coordination." The $600M+ in x402 volume has zero built-in refund mechanism, zero negotiation, and zero escrow. Cloudflare has proposed a deferred payment scheme but it's not standardized. PayCrow (launched ~March 2026) offers crude x402 escrow with auto-disputes based on HTTP status codes. KAMIYO provides ZK-proof oracle voting but lacks a negotiation protocol.

**DealRail's differentiation matrix:**

| Feature | x402 (raw) | PayCrow | KAMIYO | **DealRail** |
|---------|-----------|---------|--------|-------------|
| Agent-native | ✅ | ✅ | ✅ | ✅ |
| Negotiation protocol | ❌ | ❌ | ❌ | **✅** |
| Human policy bounds | ❌ | Partial | Partial | **✅** |
| Escrow | ❌ | ✅ | ✅ | ✅ |
| Delivery verification | ❌ | HTTP status only | ZK oracles | **Multi-signal** |
| ERC-8183 implementation | ❌ | ❌ | ❌ | **✅** |
| ERC-8004 reputation | ❌ | 25% weight | ❌ | **Native hooks** |

The "auditable autonomy" narrative is also ascendant. Vitalik Buterin has warned against "agents that lengthen the feedback loop between humans and AI." Chainalysis describes the ideal as "policy-constrained, context-aware decisions" by agents with "immutable execution and recording" by blockchains. DealRail's human-defined policy bounds → agent negotiation → smart contract enforcement exactly matches this vision.

---

## ERC-8004 provides the identity and reputation backbone

**ERC-8004 (Trustless Agents)**, live on Ethereum mainnet since January 29, 2026, defines three lightweight onchain registries that DealRail should integrate natively:

The **Identity Registry** (ERC-721 based) mints each agent as an NFT with a URI pointing to a JSON registration file describing services, endpoints, pricing, wallet addresses, and x402 support. DealRail agents register here for discoverability. The global identifier format is `eip155:{chainId}:{registryAddress}:{agentId}`.

The **Reputation Registry** enables post-transaction feedback with signed authorization from the server agent (preventing spam). Feedback can include `proofOfPayment` with transaction hashes. DealRail's ERC-8183 hooks should write to this registry after every `complete()` and `reject()` — creating a **virtuous cycle where completed deals build portable reputation that enables better future deals**.

The **Validation Registry** supports multiple trust models: social consensus, crypto-economic validation (staking/slashing), and TEE attestation. DealRail evaluators can post validation attestations here for verifiable delivery proofs.

Deployed contract addresses are identical across chains: Identity at `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`, Reputation at `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`, on Ethereum Mainnet, Base, Linea, and Sepolia testnets. The authors include Marco De Rossi (MetaMask), Davide Crapis (Ethereum Foundation), Jordan Ellis (Google), and Erik Reppel (Coinbase) — heavyweight backing that signals this will become the standard.

---

## The demo must show autonomous deal completion in 60 seconds

Hackathon winners consistently follow one pattern: **the demo is the product**. A polished working demo beats deeper technical projects with poor presentations every time. Multiple judges and serial hackathon winners confirm this. ETHGlobal's official criteria emphasize "creativity, functionality, and quality of final product" plus "wow factor."

**Recommended demo script (2–3 minutes):**

**Opening hook (15 seconds):** "AI agents processed $600 million in payments last year through x402. Every single one was irreversible. If an agent pays for a service and gets garbage back, there's no recourse. Watch what happens when agents can actually negotiate, escrow, and verify before settling."

**Core demo (90 seconds):** Show two AI agents completing a deal live:
1. **Agent A** (buyer) discovers Agent B via ERC-8004 registry, checks reputation score
2. Agents negotiate price within human-defined policy bounds (show the policy: max $50, quality threshold 0.8, 30-minute timeout)
3. Buyer agent funds escrow — show the transaction on Base Sepolia explorer
4. Seller agent submits deliverable — show the hash commitment onchain
5. Evaluator agent verifies delivery — show multi-signal verification (content hash match + quality score)
6. Escrow releases — show the settlement transaction, funds flowing to provider minus fee
7. Reputation updates automatically via ERC-8183 hooks → ERC-8004 registry

**Failure case (30 seconds):** Run a second deal where the seller submits garbage. Evaluator rejects. Escrow refunds automatically. Show the refund transaction.

**Close (15 seconds):** "DealRail is the trust layer the agent economy is missing. Built on ERC-8183 and ERC-8004. Deployed on Base and Celo. Integrated with MetaMask Delegations, Lit Protocol, Locus, Olas, Uniswap, ENS, and Self.xyz."

**Critical demo preparation:**
- Pre-fund all test wallets with USDC on Base Sepolia and Celo Alfajores
- Pre-register agents in ERC-8004 registry
- Record a backup video in case the live demo breaks
- Design a unique UI showing the deal flow as a visual pipeline (not a chat interface — everyone does chat interfaces)
- Show the block explorer links at every transaction step
- Keep the total demo under 3 minutes; judges scan hundreds of projects

---

## The x402n negotiation layer is DealRail's novel contribution

The Kairen Protocol and x402n documentation could not be fetched publicly (likely pre-launch or access-controlled), but based on the naming convention and project description, **x402n extends x402 with multi-round offchain negotiation**. Standard x402 is take-it-or-leave-it: server posts a price, client pays or doesn't. x402n adds the missing proposal/counter-proposal exchange within cryptographically enforced policy bounds.

This is architecturally novel. The **recommended flow for the hackathon:**

1. Buyer agent discovers seller via ERC-8004 + skill.md
2. x402n negotiation: buyer proposes terms (price, quality spec, deadline) → seller counter-proposes → rounds continue within both parties' policy bounds → agreement reached
3. Agreement triggers `createJob()` on ERC-8183 contract with agreed terms
4. `setBudget()` records the negotiated price
5. `fund()` locks USDC in escrow
6. Seller performs work, calls `submit()` with deliverable hash
7. Evaluator verifies, calls `complete()` → settlement
8. Hooks update ERC-8004 reputation

The offchain negotiation should be logged (IPFS or Filecoin for immutability) and referenced in the job description. This creates an auditable trail of how the deal was formed — critical for the "Agents that Cooperate" theme where the question is "can machines keep promises?"

---

## What would make DealRail useful beyond the hackathon

The agent commerce market is projected at **$3–5 trillion by 2030** (Galaxy estimates), with **400,000+ AI agents already holding purchasing power** and processing 140M transactions worth $43M in 9 months (Circle data, March 2026). Morgan Stanley projects $190–385B in US agentic e-commerce alone by 2030. The infrastructure layer where DealRail operates — between payment initiation and settlement — is the critical missing piece.

Three unsolved problems DealRail addresses for real-world adoption:

**Payment irreversibility** is the #1 gap. PayCrow's launch blog states agents are "losing funds to 500 errors or garbage data from unknown sellers on Base." With $600M+ in x402 volume having no refund mechanism, the demand for conditional settlement is demonstrated and growing.

**Delivery quality verification** remains primitive. Current solutions check only HTTP status codes and JSON schema compliance. There is no standardized way to verify the *quality* of delivered agent services. DealRail's evaluator pattern — supporting AI multi-model consensus, ZK proofs, oracle attestation, and human review — is architecturally flexible enough to support multiple verification paradigms.

**Human oversight of agent spending** lacks onchain enforcement. Google AP2 has mandate layers but is fiat-focused. DealRail's combination of MetaMask Delegations (ERC-7710 with caveat enforcers) for authorization scoping and ERC-8183 escrow for execution enforcement creates a complete "auditable autonomy" stack — exactly what **52% of consumers** say they need before trusting AI agents to make purchases on their behalf (IBM, January 2026).

## Conclusion

DealRail should be built as a reference implementation of ERC-8183 with three novel extensions: x402n negotiation protocol for the offchain deal formation phase, ERC-8004 reputation hooks for post-settlement trust accumulation, and MetaMask Delegation (ERC-7710) integration for human-defined policy enforcement. The architecture naturally spans 10 sponsor tracks without artificial stretching — each integration addresses a genuine layer of the stack. The demo should lead with the "holy shit" moment of two agents completing an autonomous negotiated deal with escrow in under 60 seconds, followed by a failure-case showing automatic refund. The narrative positioning is "the missing middleware for x402" — trust infrastructure that turns irreversible push payments into verifiable, negotiated, escrowed commerce. This fills the single largest gap in the agent economy stack, aligns with three of four hackathon themes, and implements an Ethereum Foundation-backed standard that is less than three weeks old.