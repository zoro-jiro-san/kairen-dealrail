# Kairen DealRail — Product Requirements Document (PRD)

**Version:** 2.1
**Date:** 2026-03-17
**Status:** Active Build (Hackathon: March 13–22, 2026)
**Project:** Kairen DealRail
**Repo:** https://github.com/zoro-jiro-san/kairen-dealrail
**Agent Lead:** Zoro | **Human Lead:** Sarthi

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Hackathon Context & Rules](#3-hackathon-context--rules)
4. [Product Vision & Positioning](#4-product-vision--positioning)
5. [Sponsor Track Strategy (10 Tracks)](#5-sponsor-track-strategy-10-tracks)
6. [System Architecture](#6-system-architecture)
7. [Smart Contract Specification](#7-smart-contract-specification)
8. [Agent Workflows](#8-agent-workflows)
9. [x402n Negotiation Protocol Integration](#9-x402n-negotiation-protocol-integration)
10. [Sponsor Integration Specifications](#10-sponsor-integration-specifications)
11. [Technical Stack](#11-technical-stack)
12. [Repository Structure](#12-repository-structure)
13. [API Specification](#13-api-specification)
14. [Roadmap & Phases](#14-roadmap--phases)
15. [Checkpoints & Milestones](#15-checkpoints--milestones)
16. [Testing Strategy](#16-testing-strategy)
17. [Demo Strategy](#17-demo-strategy)
18. [Submission Checklist](#18-submission-checklist)
19. [Risk Register & Mitigations](#19-risk-register--mitigations)
20. [Glossary](#20-glossary)

---

## Latest Iteration Update (March 17, 2026)

Current implementation includes:
- Reverse-auction rounds in negotiation flow
- Offer batching + explicit deal confirmation
- Savings receipt generation
- Live activity feed for negotiation lifecycle
- Dual payment rails (`x402` simple pay-per-call + `x402n` negotiated flow)

Reference architecture for this iteration:
- `docs/architecture/ARCHITECTURE_LATEST_ITERATION_MAR17.md`

---

## 1. Executive Summary

**Kairen DealRail** is a machine-native deal execution rail where AI agents negotiate within human-defined policy bounds, lock funds in smart contract escrow, and release settlement only after verifiable delivery checks.

**One-liner:** *Negotiate offchain, commit onchain, settle by proof.*

DealRail implements **ERC-8183 (Agentic Commerce Protocol)** — a Draft ERC created February 25, 2026 by the Ethereum Foundation's dAI team and Virtuals Protocol. It extends ERC-8183 with three novel contributions:

1. **x402n Negotiation Layer** — Multi-round offchain negotiation via Kairen's RFO (Request for Offer) protocol, replacing the take-it-or-leave-it model of raw x402 payments
2. **ERC-8004 Reputation Hooks** — Automatic post-settlement reputation writes creating a trust flywheel
3. **MetaMask Delegation (ERC-7710) Authorization** — Human-defined spending policies enforced onchain via caveat enforcers

The project targets **10 sponsor tracks** at The Synthesis hackathon (March 13–22, 2026), with a combined prize pool exceeding **$45,000** across targeted tracks.

**Why this wins:** Payment initiation is solved (x402 has processed $600M+). Payment *coordination* — negotiation, escrow, delivery verification, and dispute resolution — is not. DealRail is the trust layer the agent economy is missing.

---

## 2. Problem Statement

### The Gap

AI agents processed $600M+ in payments via x402 in 2025-2026. Every single payment was:

- **Irreversible** — No refund mechanism if the service fails
- **Non-negotiable** — Server posts price, client pays or doesn't
- **Unverified** — No delivery quality checks before settlement
- **Unscoped** — No onchain enforcement of human spending policies

### What Exists Today

| Solution | What it does | What it misses |
|----------|-------------|----------------|
| x402 (Coinbase) | HTTP 402 payment-required flow | No escrow, no negotiation, no refunds |
| PayCrow | Crude escrow layer on x402 | Only checks HTTP status codes, no negotiation |
| KAMIYO | ZK-proof oracle voting for disputes | No negotiation protocol, no human policy enforcement |
| ERC-8183 (raw) | Job escrow with evaluator pattern | No negotiation, no reputation integration, no delegation |

### What DealRail Adds

The **full stack** from human policy → agent negotiation → onchain commitment → delivery verification → settlement → reputation update. No other project in the Synthesis hackathon field covers this complete flow.

---

## 3. Hackathon Context & Rules

### Event Details

| Field | Value |
|-------|-------|
| Name | The Synthesis |
| Dates | March 13–22, 2026 (10-day build window) |
| Format | Fully online, hosted on Devfolio |
| Judging | AI agent judges (sponsor-specific) + human judges |
| Mid-hack Feedback | March 18 — AI judges provide interim feedback |
| Winners Announced | March 25, 2026 |
| Prize Pool | $50K–$100K+ across 106 prizes |
| Platform | https://synthesis.devfolio.co |
| Telegram | https://nsb.dev/synthesis-updates |

### Four Core Themes

DealRail maps to **three of four** themes — unusually strong alignment:

1. **Agents that Pay** ✅ — Scoped spending, onchain settlement, conditional escrow
2. **Agents that Trust** ✅ — ERC-8004 identity, onchain reputation, verifiable service quality
3. **Agents that Cooperate** ✅ — Smart contract commitments, human-defined negotiation bounds, transparent dispute resolution
4. **Agents that Keep Secrets** ⚠️ — Addressable via encrypted negotiation terms (stretch goal)

### Mandatory Submission Requirements

- Working demo (not idea-only)
- Open-source code with visible commit history (no single large commits)
- Meaningful agent contribution (not a superficial wrapper)
- Onchain artifacts (contracts, transactions, attestations)
- Collaboration log documenting human-agent process
- Demo video (2–4 minutes)
- ERC-8004 agent registration on Base Mainnet

### Rules to Remember

- "Solve a problem, not a checklist" — coherence over integration count
- "Don't over-scope" — working demo of one scoped idea beats ambitious architecture
- AI judges evaluate per sponsor criteria; open track synthesizes all scores
- Code must be public by deadline

---

## 4. Product Vision & Positioning

### Positioning Statement

DealRail is the **missing middleware for x402** — trust infrastructure that turns irreversible push payments into verifiable, negotiated, escrowed commerce.

### Value Proposition by Stakeholder

**For Agent Operators (Humans):**
- Set policy bounds (max spend, approved counterparties, time limits, token whitelist)
- Full audit trail of every agent action and every deal
- Automatic refund if delivery fails verification
- Portable reputation that follows your agent across platforms

**For Client Agents (Buyers):**
- Discover providers via ERC-8004 registry
- Negotiate competitive pricing via RFO workflow (5-15 offers per request)
- Funds protected in escrow until delivery verified
- Quality assurance via multi-signal evaluator

**For Provider Agents (Sellers):**
- Guaranteed payment upon verified delivery
- Competitive bidding surface for service discovery
- Reputation accumulation that drives future business
- Standards-based interface (ERC-8183) for interoperability

**For Evaluator Agents:**
- Clear verification interface (deliverable hash + quality signals)
- Immutable evaluation record onchain
- Fee collection for evaluation services

### Product Variant (Chosen for Build)

**Variant A: Deal Pipeline for Agent Operators**
- Human sets policy bounds
- Agent negotiates inside those bounds via x402n
- Smart contract enforces escrow + settlement via ERC-8183
- Best balance of demoability + real utility + sponsor track coverage

---

## 5. Sponsor Track Strategy (10 Tracks)

### Track Selection Rationale

Each track targets a **distinct layer** of the DealRail architecture. No artificial stretching — each integration addresses a genuine system component.

### Tier 1 — Highest Prize Value, Perfect Alignment

#### Track 1: Synthesis Open Track
- **Sponsor:** Synthesis Community
- **Prize:** $14,058.96 (community-funded pool)
- **Integration:** Full project — DealRail IS the open track submission
- **What judges want:** Problem-solution coherence across 3+ themes, working demo, onchain artifacts
- **DealRail fit:** Primary submission targeting Agents that Cooperate + Pay + Trust

#### Track 2: Agents With Receipts — ERC-8004 (Protocol Labs)
- **Sponsor:** Protocol Labs
- **Prizes:** 1st: $4,000 | 2nd: $3,000 | 3rd: $1,004
- **Integration:** ERC-8004 agent identity + reputation registry as the trust backbone
- **What judges want:** Trusted agent interactions using ERC-8004 standard
- **DealRail fit:** Agents register in ERC-8004 Identity Registry; post-settlement hooks write to Reputation Registry; pre-fund hooks verify reputation scores

#### Track 3: Best Agent on Celo
- **Sponsor:** Celo
- **Prizes:** 1st: $3,000 | 2nd: $2,000
- **Integration:** Deploy EscrowRail on Celo with cUSD settlement token
- **What judges want:** Real agentic application on Celo demonstrating real-world utility
- **DealRail fit:** Celo's sub-cent fees make it ideal for high-frequency agent deals; cUSD provides stable settlement; Celo Sepolia testnet for development
- **Note:** Hackathon co-organizer (sodofi) is Celo DevRel Engineering Lead

#### Track 4: Best Use of Delegations (MetaMask)
- **Sponsor:** MetaMask
- **Prizes:** 1st: $3,000 | 2nd: $1,500 | 3rd: $500
- **Integration:** ERC-7710/7715 Delegation Toolkit for human→agent authorization
- **What judges want:** Creative use of delegation framework with scoped permissions
- **DealRail fit:** Human delegates escrow-funding authority with caveats: spending caps, approved counterparties, time limits, token whitelists. This IS the "human-defined policy bounds" layer.

### Tier 2 — Strong Alignment, Good Prize Value

#### Track 5: Best Bankr LLM Gateway Use
- **Sponsor:** Bankr
- **Prizes:** 1st: $3,000 | 2nd: $1,500 | 3rd: $500
- **Integration:** BankrBot API for agent wallet management and payment execution
- **What judges want:** Autonomous system using Bankr LLM Gateway with real onchain outcomes
- **DealRail fit:** BankrBot handles wallet creation, transaction signing, and broadcasting for agent participants. Natural language payment interface.

#### Track 6: Agentic Finance — Uniswap API
- **Sponsor:** Uniswap
- **Prizes:** 1st: $2,500 | 2nd: $1,500 | 3rd: $1,000
- **Integration:** Post-settlement token swap via Uniswap API
- **What judges want:** Agentic finance integration that is functional and open source
- **DealRail fit:** When escrow releases, provider can auto-swap settlement token into preferred denomination via Uniswap. "Programmable settlement."

#### Track 7: Best Use of Locus
- **Sponsor:** Locus
- **Prizes:** 1st: $2,000 | 2nd: $500 | 3rd: $500
- **Integration:** Locus MCP endpoint for USDC payment operations
- **What judges want:** Agent-native payments using Locus APIs with real onchain results
- **DealRail fit:** Locus provides the payment infrastructure layer — smart wallet per agent, spending limits, USDC escrow operations, audit trails

### Tier 3 — Valuable Additions, Lower Effort

#### Track 8: ENS Identity + Communication
- **Sponsor:** ENS
- **Prizes:** Identity 1st: $400, 2nd: $200 | Communication 1st: $400, 2nd: $200 | Open: $300
- **Integration:** ENS names for agent discovery + text records for capabilities
- **What judges want:** Meaningful ENS integration for agent identity or communication
- **DealRail fit:** Each DealRail agent gets an ENS name (e.g., `buyer.kairen.eth`). Text records store service capabilities, x402n endpoints, ERC-8004 registry links.

#### Track 9: Build with AgentCash (Merit Systems)
- **Sponsor:** Merit Systems
- **Prizes:** 1st: $1,000 | 2nd: $500 | 3rd: $250
- **Integration:** AgentCash for consuming x402 APIs with payment
- **What judges want:** Project using AgentCash to pay for x402-gated services
- **DealRail fit:** Provider agents expose x402-gated endpoints; buyer agents use AgentCash to discover and initiate payment flows that feed into DealRail escrow

#### Track 10: Escrow Ecosystem Extensions (Arkhai)
- **Sponsor:** Arkhai
- **Prizes:** Best Application: $450 | Best Extension: $450
- **Integration:** Build on Alkahest (natural-language-agreement escrow)
- **What judges want:** New arbiter, verification primitive, or obligation pattern extending the escrow ecosystem
- **DealRail fit:** DealRail's evaluator pattern IS an escrow ecosystem extension — a multi-signal verification primitive for agent commerce

### Prize Capture Summary

| Track | Best Case | Expected | Integration Layer |
|-------|----------|----------|-------------------|
| Open Track | $14,059 | $5,000 | Full project |
| ERC-8004 (Protocol Labs) | $4,000 | $3,000 | Identity + Reputation |
| Celo | $3,000 | $2,000 | Settlement Chain |
| MetaMask Delegations | $3,000 | $1,500 | Authorization |
| Bankr LLM Gateway | $3,000 | $1,500 | Wallet + Payments |
| Uniswap API | $2,500 | $1,500 | Post-Settlement Swap |
| Locus | $2,000 | $500 | Payment Infra |
| ENS | $1,500 | $400 | Discovery |
| AgentCash | $1,000 | $500 | x402 Gateway |
| Arkhai | $900 | $450 | Escrow Extension |
| **TOTAL** | **$34,959** | **$16,350** | — |

---

## 6. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    HUMAN OPERATOR LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Policy Dashboard (Next.js)                               │  │
│  │  - Set spending limits, counterparty rules, time bounds   │  │
│  │  - Review deal history & audit trail                      │  │
│  │  - Approve/reject escalated actions                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                    ERC-7710 Delegation                           │
│               (MetaMask Delegation Toolkit)                      │
│              with Caveat Enforcers for limits                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    AGENT NEGOTIATION LAYER                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  x402n Protocol (Kairen)                                  │  │
│  │  - RFO posting (buyer) / RFO discovery (provider)         │  │
│  │  - Offer submission & ranking                             │  │
│  │  - Multi-round negotiation within policy bounds           │  │
│  │  - Agreement formation → triggers onchain commitment      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ ERC-8004     │  │ ENS Names   │  │ Kairen Market        │  │
│  │ Identity +   │  │ Agent       │  │ Service Discovery    │  │
│  │ Reputation   │  │ Discovery   │  │ (market.kairen.xyz)  │  │
│  └──────────────┘  └─────────────┘  └──────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    ONCHAIN SETTLEMENT LAYER                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  EscrowRail.sol (ERC-8183 Implementation)                 │  │
│  │  States: Open → Funded → Submitted → Completed/Rejected   │  │
│  │  Roles: Client, Provider, Evaluator                       │  │
│  │  Hooks: IACPHook for pre/post action gates                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Celo         │  │ Base        │  │ Uniswap v4           │  │
│  │ (cUSD)       │  │ (USDC)      │  │ Post-Settlement      │  │
│  │ Settlement   │  │ Settlement  │  │ Token Swap           │  │
│  └──────────────┘  └─────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ BankrBot     │  │ Locus MCP   │  │ AgentCash            │  │
│  │ Wallet Mgmt  │  │ USDC Ops    │  │ x402 Gateway         │  │
│  └──────────────┘  └─────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Layer-to-Sponsor Mapping

| Layer | Component | Sponsor Track |
|-------|-----------|---------------|
| Authorization | ERC-7710 delegation + caveats | MetaMask |
| Identity | ERC-8004 registry + reputation | Protocol Labs (ERC-8004) |
| Discovery | ENS names + text records | ENS |
| Negotiation | x402n RFO workflow | Open Track / Kairen |
| Escrow Contract | ERC-8183 EscrowRail | Open Track / Arkhai |
| Settlement (Celo) | cUSD escrow on Celo | Celo |
| Settlement (Base) | USDC escrow on Base | Bankr / AgentCash |
| Payment Interface | Locus MCP + BankrBot API | Locus / Bankr |
| Post-Settlement | Uniswap API swap | Uniswap |
| Reputation | ERC-8004 hooks post-settlement | Protocol Labs (ERC-8004) |

### ERC-8183 State Machine

```
             createJob()
                 │
                 ▼
    ┌────────────────────────┐
    │        OPEN            │──── reject() by client ────┐
    │  (budget not yet set)  │                             │
    └────────────┬───────────┘                             │
                 │ fund()                                   │
                 ▼                                          │
    ┌────────────────────────┐                             │
    │       FUNDED           │──── reject() by evaluator ──┤
    │  (escrow locked)       │                             │
    └────────────┬───────────┘                             │
                 │ submit()                                 │
                 ▼                                          │
    ┌────────────────────────┐                             │
    │      SUBMITTED         │──── reject() by evaluator ──┤
    │  (awaiting evaluation) │                             │
    └────────────┬───────────┘                             │
                 │                                          │
         ┌───────┴────────┐                                │
         │                │                                 │
    complete()       reject()                               │
         │                │                                 │
         ▼                ▼                                 ▼
    ┌──────────┐   ┌──────────┐                     ┌──────────┐
    │COMPLETED │   │ REJECTED │                     │ REJECTED │
    │(pay out) │   │ (refund) │                     │ (refund) │
    └──────────┘   └──────────┘                     └──────────┘

    At any non-terminal state, after expiry:
    claimRefund() → EXPIRED (refund to client)
```

---

## 7. Smart Contract Specification

### Core Contract: EscrowRail.sol

**Standard:** ERC-8183 Agentic Commerce Protocol
**Solidity:** ^0.8.20
**Framework:** Foundry
**Chains:** Base Sepolia (dev) → Base Mainnet + Celo Sepolia (dev) → Celo Mainnet

#### Interface

```solidity
interface IEIP8183AgenticCommerce {
    function createJob(
        address provider,
        address evaluator,
        uint256 expiry,
        address hook
    ) external returns (uint256 jobId);

    function setBudget(uint256 jobId, uint256 amount) external;
    function fund(uint256 jobId, uint256 expectedBudget) external payable;
    function submit(uint256 jobId, bytes32 deliverable) external;
    function complete(uint256 jobId, bytes32 reason) external;
    function reject(uint256 jobId, bytes32 reason) external;
    function claimRefund(uint256 jobId) external;
}
```

#### Events

```solidity
event JobCreated(uint256 indexed jobId, address client, address provider, address evaluator);
event BudgetSet(uint256 indexed jobId, uint256 amount, address setter);
event JobFunded(uint256 indexed jobId, uint256 amount);
event JobSubmitted(uint256 indexed jobId, bytes32 deliverable);
event JobCompleted(uint256 indexed jobId, bytes32 reason);
event JobRejected(uint256 indexed jobId, bytes32 reason);
event JobExpired(uint256 indexed jobId);
```

#### Hook Interface

```solidity
interface IACPHook {
    function beforeAction(uint256 jobId, bytes4 action, bytes calldata data) external;
    function afterAction(uint256 jobId, bytes4 action, bytes calldata data) external;
}
```

**Hook use cases in DealRail:**

| Hook Point | Action | Purpose |
|------------|--------|---------|
| beforeFund | fund() | Verify ERC-8004 reputation ≥ threshold |
| beforeFund | fund() | Check MetaMask delegation caveats |
| afterComplete | complete() | Write to ERC-8004 Reputation Registry |
| afterReject | reject() | Write negative reputation signal |
| beforeSubmit | submit() | Verify provider is still registered in ERC-8004 |

### Identity Contract: Multi-Provider Verifier

```solidity
interface IIdentityVerifier {
    struct VerificationResult {
        bool isVerified;
        uint256 reputationScore;  // 0-1000
        string tier;
        bool isSuspended;
    }

    function verify(address agent) external view returns (VerificationResult memory);
    function verifierName() external view returns (string memory);
}
```

**Implementations:**
1. `ERC8004Verifier.sol` — Reads from ERC-8004 Identity + Reputation registries
2. `SignetIDVerifier.sol` — Reads from Kairen ForgeID (CourtAccess)
3. `NullVerifier.sol` — Passthrough for permissionless mode

### ERC-8004 Contract Addresses (Deployed)

| Contract | Address | Chains |
|----------|---------|--------|
| Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | Ethereum, Base, Linea, Sepolia |
| Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` | Ethereum, Base, Linea, Sepolia |

### Deployment Plan

| Chain | Network | Contract | Settlement Token |
|-------|---------|----------|-----------------|
| Base | Sepolia (testnet) | EscrowRail + Verifiers | ETH / test USDC |
| Base | Mainnet (demo) | EscrowRail + Verifiers | USDC |
| Celo | Celo Sepolia (testnet) | EscrowRail + Verifiers | test cUSD |
| Celo | Mainnet (demo) | EscrowRail + Verifiers | cUSD |

---

## 8. Agent Workflows

### Workflow A: Client Agent (Buyer) — Full Deal Lifecycle

```
STEP 1: DISCOVER PROVIDER
├── Query ERC-8004 Identity Registry for agents with matching capabilities
├── Resolve ENS names for human-readable discovery
├── Browse Kairen Market (market.kairen.xyz) for service listings
├── Check ERC-8004 Reputation Registry for trust scores
└── Output: List of qualified providers with reputation scores

STEP 2: NEGOTIATE VIA x402n
├── POST /api/v1/rfos — Create RFO with requirements + budget range
│   ├── Requirements: service type, quality threshold, deadline
│   ├── Budget: min/max within human-defined policy bounds
│   └── Policy check: verify RFO params within delegation caveats
├── RECEIVE offers from providers (target: 5-15 competing offers)
├── GET /api/v1/rfos/:id/offers/ranked — Auto-ranked by price/delivery/reputation
├── SELECT best offer within policy bounds
└── POST /api/v1/offers/:id/accept — Accept offer (creates deal)

STEP 3: COMMIT ONCHAIN
├── createJob(provider, evaluator, expiry, hook) → jobId
│   ├── Hook: DealRailHook (gates fund on delegation check + reputation check)
│   ├── Evaluator: designated verification agent
│   └── Expiry: negotiated deadline + buffer
├── setBudget(jobId, agreedAmount)
└── fund(jobId, expectedBudget) → FUNDED
    ├── Funds transferred from client wallet to escrow contract
    ├── MetaMask Delegation caveat check enforced via hook
    └── Event: JobFunded emitted with amount

STEP 4: AWAIT DELIVERY
├── Monitor contract state for Submitted event
├── If expiry approaches with no submission:
│   └── claimRefund(jobId) → EXPIRED, funds returned
└── Receive notification when provider calls submit()

STEP 5: SETTLEMENT
├── Evaluator calls complete(jobId, reason) → COMPLETED
│   ├── Funds released to provider
│   ├── afterComplete hook writes ERC-8004 reputation (positive)
│   └── Audit trail: tx hash, reason bytes, timestamp
├── OR: Evaluator calls reject(jobId, reason) → REJECTED
│   ├── Funds returned to client
│   ├── afterReject hook writes ERC-8004 reputation (negative)
│   └── Dispute evidence logged onchain
└── Client agent confirms delivery receipt
```

### Workflow B: Provider Agent (Seller) — Full Deal Lifecycle

```
STEP 1: REGISTER
├── Register in ERC-8004 Identity Registry with service capabilities
├── Set up ENS name with text records (capabilities, endpoint, pricing)
├── List services on Kairen Market (market.kairen.xyz)
└── Configure x402n endpoint for receiving RFOs

STEP 2: DISCOVER & BID
├── GET /api/v1/rfos — Browse open RFOs matching capabilities
├── Filter by: budget range, service type, deadline, required reputation tier
├── Evaluate profitability vs capacity
├── POST /api/v1/rfos/:id/offers — Submit competitive offer
│   ├── Price: within RFO budget range
│   ├── Delivery time: commitment
│   ├── SLA: quality guarantees
│   └── Credentials: ERC-8004 agent ID + reputation score
└── Wait for acceptance notification

STEP 3: EXECUTE WORK
├── Offer accepted → Deal created → Payment locked in escrow
├── Perform service as per agreed terms
├── Generate deliverable + compute hash (bytes32)
└── Store deliverable content (IPFS via Pinata)

STEP 4: SUBMIT DELIVERABLE
├── submit(jobId, deliverableHash) → SUBMITTED
│   ├── deliverable = keccak256 of actual content
│   └── Content accessible at IPFS CID for evaluator
└── Wait for evaluator verdict

STEP 5: RECEIVE PAYMENT
├── Evaluator calls complete() → funds released to provider wallet
├── ERC-8004 reputation updated (positive feedback written via hook)
├── Optional: auto-swap received token via Uniswap API into preferred denomination
└── OR: Evaluator calls reject() → provider receives nothing, negative reputation
```

### Workflow C: Evaluator Agent — Verification Flow

```
STEP 1: ASSIGNMENT
├── Designated at job creation (createJob parameter)
├── Can be: automated quality checker, multi-model consensus, or human reviewer
└── Receives notification when provider calls submit()

STEP 2: VERIFY DELIVERABLE
├── Fetch deliverable content from IPFS using hash
├── Run verification checks:
│   ├── Signal 1: Content hash matches submitted bytes32
│   ├── Signal 2: Quality score meets threshold (LLM evaluation)
│   ├── Signal 3: SLA compliance (delivery time within committed window)
│   └── Signal 4: Format/schema validation
├── Aggregate signals into pass/fail decision
└── Generate reason bytes32 (hash of evaluation report)

STEP 3: RENDER VERDICT
├── If PASS: complete(jobId, reasonHash) → COMPLETED
│   └── Escrow releases to provider
├── If FAIL: reject(jobId, reasonHash) → REJECTED
│   └── Escrow refunds to client
└── Evaluation report stored on IPFS for audit trail

STEP 4: REPUTATION
├── afterComplete/afterReject hook fires automatically
├── Writes feedback to ERC-8004 Reputation Registry
│   ├── proofOfPayment: settlement tx hash
│   ├── feedbackScore: quality rating
│   └── signed by evaluator
└── Reputation immutably recorded onchain
```

### Workflow D: Human Operator — Policy & Oversight

```
STEP 1: SET POLICY BOUNDS
├── Open Dashboard (Next.js frontend)
├── Configure delegation via MetaMask Delegation Toolkit:
│   ├── Spending cap: max amount per deal
│   ├── Approved counterparties: whitelist or minimum reputation
│   ├── Time window: delegation valid for N hours/days
│   ├── Token whitelist: only USDC/cUSD
│   └── Chain restriction: Base + Celo only
├── Sign delegation → creates onchain delegation with caveats
└── Agent now authorized to fund escrow within bounds

STEP 2: MONITOR
├── Real-time dashboard showing:
│   ├── Active deals (state, counterparty, amount, deadline)
│   ├── Pending escalations (deals exceeding CAUTION threshold)
│   ├── Settlement history (completed + rejected)
│   └── Reputation score trajectory
├── Notification on state changes
└── Full transaction audit trail with block explorer links

STEP 3: INTERVENE (when needed)
├── ESCALATE tier actions require explicit human approval
│   ├── Deals above spending cap
│   ├── Counterparties below reputation threshold
│   └── Unusual patterns flagged by agent
├── Approve or reject escalated actions via dashboard
└── Revoke delegation if agent behavior is concerning

STEP 4: REVIEW
├── Post-deal analysis: cost efficiency, provider quality
├── Adjust policy bounds based on outcomes
└── Export audit trail for compliance/reporting
```

---

## 9. x402n Negotiation Protocol Integration

### How x402n Works

x402n extends the x402 payment flow with **multi-round offchain negotiation** via a structured RFO (Request for Offer) workflow. Standard x402 is take-it-or-leave-it; x402n adds competitive bidding and term negotiation.

### API Endpoints (from x402n.kairen.xyz)

```
Base URL: https://x402n.kairen.xyz/api/v1
Auth: Bearer JWT token

RFOs:
  POST   /rfos                    Create new RFO
  GET    /rfos                    List RFOs (with filters)
  GET    /rfos/:id                Get RFO details
  GET    /rfos/:id/offers         List all offers
  GET    /rfos/:id/offers/ranked  Get ranked offers

Offers:
  POST   /rfos/:id/offers         Submit offer
  GET    /offers/:id              Get offer details
  POST   /offers/:id/accept       Accept offer → creates deal

Deals:
  GET    /deals                   List deals
  GET    /deals/:id               Get deal details
  POST   /deals/:id/lock-payment  Lock payment in escrow
  POST   /deals/:id/confirm-delivery  Confirm delivery
  POST   /deals/:id/release-payment   Release funds
```

### x402n → ERC-8183 Bridge

The critical integration point: when an x402n deal is accepted, it triggers ERC-8183 contract creation onchain.

```
x402n Workflow:                    ERC-8183 Contract:
─────────────────                  ──────────────────
RFO created                        (offchain)
Offers received                    (offchain)
Offer accepted ──────────────────► createJob()
Budget agreed ───────────────────► setBudget()
Payment locked ──────────────────► fund()
Service delivered                  (offchain)
Deliverable submitted ───────────► submit()
Delivery confirmed ──────────────► complete() or reject()
Payment released                   (automatic via contract)
```

### RFO Schema (DealRail Extension)

```json
{
  "title": "API Integration Service",
  "description": "Build REST API integration for weather data",
  "requirements": {
    "serviceType": "development",
    "qualityThreshold": 0.8,
    "deliverableFormat": "application/json",
    "maxDeliveryTime": "2h"
  },
  "budget": {
    "min": "10000000",
    "max": "50000000",
    "token": "USDC",
    "chain": "base"
  },
  "policyBounds": {
    "delegationId": "0x...",
    "maxSpend": "50000000",
    "approvedProviderMinReputation": 300,
    "expiryWindow": "24h"
  },
  "evaluator": {
    "address": "0x...",
    "type": "automated",
    "criteria": ["hash_match", "quality_score", "sla_compliance"]
  },
  "tags": ["api", "integration", "weather"]
}
```

---

## 10. Sponsor Integration Specifications

### 10.1 ERC-8004 Integration (Protocol Labs)

**Purpose:** Agent identity + reputation backbone

**Implementation:**

1. **Registration:** At agent startup, register in ERC-8004 Identity Registry on Base Mainnet
   - Mint agent NFT with URI pointing to JSON registration file
   - JSON includes: name, description, services, x402n endpoint, wallet address

2. **Pre-Fund Gate (Hook):** Before `fund()`, hook checks provider's ERC-8004 reputation
   ```solidity
   function beforeAction(uint256 jobId, bytes4 action, bytes calldata data) external {
       if (action == FUND_SELECTOR) {
           uint256 agentId = registry.agentIdOf(provider);
           require(agentId > 0, "Provider not registered");
           uint256 rep = reputationRegistry.getReputation(agentId);
           require(rep >= minReputation, "Insufficient reputation");
       }
   }
   ```

3. **Post-Settlement Reputation Write (Hook):** After `complete()` or `reject()`, write feedback
   ```solidity
   function afterAction(uint256 jobId, bytes4 action, bytes calldata data) external {
       if (action == COMPLETE_SELECTOR) {
           reputationRegistry.addFeedback(providerAgentId, positiveFeedback);
       } else if (action == REJECT_SELECTOR) {
           reputationRegistry.addFeedback(providerAgentId, negativeFeedback);
       }
   }
   ```

**Deliverable:** Working reputation loop: register → trade → reputation update → better future trades

### 10.2 Celo Integration

**Purpose:** Settlement chain for low-cost agent commerce

**Implementation:**

1. Deploy EscrowRail.sol on Celo Sepolia (testnet) and optionally Celo Mainnet
2. Use cUSD as settlement token (modify contract for ERC-20 instead of native ETH)
3. Demonstrate mobile-friendly agent interaction (reference MiniPay)
4. Show sub-cent transaction costs in demo

**ERC-20 Escrow Modification:**
```solidity
IERC20 public settlementToken; // cUSD on Celo, USDC on Base

function fund(uint256 jobId, uint256 expectedBudget) external {
    // Transfer ERC-20 instead of native ETH
    settlementToken.transferFrom(msg.sender, address(this), expectedBudget);
    // ... rest of fund logic
}
```

### 10.3 MetaMask Delegations Integration

**Purpose:** Human-defined policy enforcement via scoped delegations

**Implementation:**

1. Install MetaMask Delegation Toolkit (`@codefi/delegator-core-viem`)
2. Human creates delegation with caveats:
   - `AllowedMethodsEnforcer` — only `fund()` and `createJob()` allowed
   - `NativeTokenTransferAmountEnforcer` — max spend per transaction
   - `TimestampEnforcer` — delegation valid for 24 hours
   - `AllowedTargetsEnforcer` — only interact with verified EscrowRail contracts

3. Agent redeems delegation when funding escrow:
   ```typescript
   const delegation = createDelegation({
     delegate: agentAddress,
     delegator: humanAddress,
     caveats: [
       { enforcer: allowedMethods, terms: encodeFundSelector() },
       { enforcer: spendLimit, terms: encodeMaxAmount(50_000_000) },
       { enforcer: timeLimit, terms: encodeExpiry(24 * 3600) }
     ]
   });
   ```

**Deliverable:** Agent funds escrow using delegation, visibly constrained by human-set caveats

### 10.4 Bankr LLM Gateway Integration

**Purpose:** Agent wallet management and natural-language payment execution

**Implementation:**

1. BankrBot API for agent wallet creation and management
2. Natural language interface: `"Fund escrow 0x... with 10 USDC on Base"`
3. Transaction signing and broadcasting via BankrBot wallet
4. Polling for transaction confirmation

**Endpoint:** `POST https://api.bankr.bot/agent/prompt`

### 10.5 Uniswap API Integration

**Purpose:** Post-settlement token swap

**Implementation:**

1. After `complete()` event, provider agent auto-swaps settlement token
2. Use Uniswap API to get optimal swap route
3. Execute swap from USDC → provider's preferred token
4. Log swap transaction as part of deal audit trail

### 10.6 Locus Integration

**Purpose:** USDC payment operations with spending limits

**Implementation:**

1. Connect to Locus MCP endpoint: `mcp.paywithlocus.com/mcp`
2. Create per-agent smart wallets via Locus
3. Set spending limits matching human policy bounds
4. Execute escrow funding via Locus payment API

### 10.7 ENS Integration

**Purpose:** Human-readable agent discovery

**Implementation:**

1. Register agent ENS names (e.g., `buyer.dealrail.eth`)
2. Set text records:
   - `com.kairen.x402n` → x402n endpoint URL
   - `com.erc8004.agentId` → ERC-8004 registry ID
   - `com.dealrail.capabilities` → JSON of service capabilities
3. Resolve ENS in discovery flow before ERC-8004 lookup

### 10.8 AgentCash Integration

**Purpose:** x402 payment gateway for accessing deal services

**Implementation:**

1. Provider exposes deal-related endpoints as x402-gated resources
2. Buyer agent uses AgentCash to pay for endpoint access
3. Payment receipt feeds into DealRail's deal initiation flow

### 10.9 Arkhai (Escrow Ecosystem) Integration

**Purpose:** Extend the escrow ecosystem with DealRail's evaluator pattern

**Implementation:**

1. Position DealRail as a new verification primitive in the Alkahest ecosystem
2. Demonstrate the evaluator pattern as composable with other escrow primitives
3. Document how DealRail's multi-signal evaluation extends beyond basic HTTP status checks

---

## 11. Technical Stack

### Smart Contracts

| Component | Technology |
|-----------|-----------|
| Language | Solidity ^0.8.20 |
| Framework | Foundry (forge, cast, anvil) |
| Libraries | OpenZeppelin (ReentrancyGuard, Ownable, IERC20) |
| Standard | ERC-8183 Agentic Commerce Protocol |
| Identity | ERC-8004 (deployed at known addresses) |
| Testing | Foundry forge test + fork testing |
| Gas | forge snapshot for benchmarking |

### Backend

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express.js or Hono |
| Database | PostgreSQL + Prisma ORM |
| Blockchain | ethers.js v6 or viem |
| Payments | BankrBot API + Locus MCP |
| Events | Contract event listener (WebSocket) |
| Storage | Pinata (IPFS) for deliverables |

### Frontend

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Wallet | Wagmi v2 + RainbowKit |
| Delegation | MetaMask Delegation Toolkit |
| UI | shadcn/ui + Tailwind CSS |
| State | React Query / Zustand |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| RPC (Base) | Alchemy |
| RPC (Celo) | Celo public RPC / Infura |
| Hosting Frontend | Vercel |
| Hosting Backend | Railway |
| IPFS | Pinata |
| CI/CD | GitHub Actions |

---

## 12. Repository Structure

```
kairen-dealrail/
├── README.md                          # Project overview + run instructions
├── PRD.md                             # This document
├── ARCHITECTURE.md                    # Technical architecture
│
├── contracts/                         # Smart contracts (Foundry)
│   ├── foundry.toml
│   ├── src/
│   │   ├── EscrowRail.sol             # Core ERC-8183 implementation
│   │   ├── EscrowRailERC20.sol        # ERC-20 variant (for Celo cUSD)
│   │   ├── DealRailHook.sol           # IACPHook with reputation + delegation gates
│   │   ├── interfaces/
│   │   │   ├── IEIP8183AgenticCommerce.sol
│   │   │   ├── IACPHook.sol
│   │   │   └── IIdentityVerifier.sol
│   │   └── identity/
│   │       ├── ERC8004Verifier.sol
│   │       ├── SignetIDVerifier.sol
│   │       └── NullVerifier.sol
│   ├── test/
│   │   ├── EscrowRail.t.sol           # Core contract tests
│   │   ├── EscrowRailERC20.t.sol      # ERC-20 variant tests
│   │   ├── DealRailHook.t.sol         # Hook tests
│   │   └── integration/
│   │       ├── ERC8004Integration.t.sol
│   │       └── FullDealFlow.t.sol
│   ├── script/
│   │   ├── Deploy.s.sol               # Base deployment
│   │   ├── DeployCelo.s.sol           # Celo deployment
│   │   └── DemoSetup.s.sol            # Pre-configure demo state
│   └── deployments/                   # Deployed addresses
│       ├── base-sepolia.json
│       ├── base-mainnet.json
│       ├── celo-sepolia.json
│       └── celo-mainnet.json
│
├── backend/                           # API server
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                   # Server entry
│   │   ├── routes/
│   │   │   ├── jobs.ts                # Job CRUD endpoints
│   │   │   ├── deals.ts               # Deal lifecycle endpoints
│   │   │   └── health.ts
│   │   ├── services/
│   │   │   ├── escrow.ts              # Contract interaction service
│   │   │   ├── x402n.ts               # x402n API client
│   │   │   ├── evaluator.ts           # Delivery verification logic
│   │   │   ├── reputation.ts          # ERC-8004 reputation service
│   │   │   ├── bankr.ts               # BankrBot integration
│   │   │   ├── locus.ts               # Locus MCP integration
│   │   │   └── uniswap.ts             # Uniswap API integration
│   │   ├── listeners/
│   │   │   └── contractEvents.ts      # Event listener for state changes
│   │   ├── agents/
│   │   │   ├── buyerAgent.ts          # Client agent logic
│   │   │   ├── providerAgent.ts       # Provider agent logic
│   │   │   └── evaluatorAgent.ts      # Evaluator agent logic
│   │   └── utils/
│   │       ├── delegation.ts          # MetaMask delegation helpers
│   │       ├── ens.ts                 # ENS resolution helpers
│   │       └── ipfs.ts                # Pinata IPFS helpers
│   └── prisma/
│       └── schema.prisma              # Database schema
│
├── frontend/                          # Dashboard UI
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Landing / deal overview
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx           # Deal list
│   │   │   │   └── [id]/page.tsx      # Deal detail + audit trail
│   │   │   ├── policy/
│   │   │   │   └── page.tsx           # Human policy configuration
│   │   │   └── demo/
│   │   │       └── page.tsx           # Demo walkthrough view
│   │   ├── components/
│   │   │   ├── DealPipeline.tsx       # Visual deal state machine
│   │   │   ├── PolicyEditor.tsx       # Delegation configuration
│   │   │   ├── ReputationBadge.tsx    # ERC-8004 reputation display
│   │   │   ├── AuditTimeline.tsx      # Transaction event timeline
│   │   │   └── AgentStatus.tsx        # Connected agent info
│   │   └── hooks/
│   │       ├── useEscrowRail.ts       # Contract interaction hook
│   │       ├── useDelegation.ts       # MetaMask delegation hook
│   │       └── useBankrPayment.ts     # BankrBot payment hook
│   └── public/
│
├── docs/                              # Documentation
│   ├── IDEA.md
│   ├── demo-script.md
│   ├── integration-guide.md
│   └── conversation-log.md            # Human-agent collaboration log
│
├── research/                          # Research artifacts
│   ├── 01-research-brief.md
│   ├── 02-technical-blueprint.md
│   └── 03-tx-opinion.md
│
└── scripts/                           # Utility scripts
    ├── demo-setup.sh                  # Set up demo state
    ├── deploy-all.sh                  # Deploy to all chains
    └── generate-demo-data.ts          # Seed demo transactions
```

---

## 13. API Specification

### Backend API Endpoints

**Base URL:** `https://api.dealrail.kairen.xyz/v1`

#### Jobs

```
POST   /jobs                    Create job (triggers onchain createJob)
GET    /jobs                    List all jobs
GET    /jobs/:id                Get job details + state
POST   /jobs/:id/fund           Fund escrow (triggers onchain fund)
POST   /jobs/:id/submit         Submit deliverable (triggers onchain submit)
POST   /jobs/:id/complete       Complete job (evaluator only)
POST   /jobs/:id/reject         Reject job (evaluator or client)
GET    /jobs/:id/audit           Get full audit trail
```

#### Deals (x402n bridge)

```
POST   /deals/from-offer        Create deal from accepted x402n offer
GET    /deals/:id               Get deal with x402n + onchain state
GET    /deals/:id/timeline      Merged event timeline (offchain + onchain)
```

#### Agents

```
GET    /agents/:address          Get agent info (ERC-8004 + ENS)
GET    /agents/:address/reputation  Get reputation history
POST   /agents/register          Register in ERC-8004 registry
```

#### Policy

```
POST   /policy/delegation        Create MetaMask delegation
GET    /policy/delegation/:id    Get delegation status + usage
DELETE /policy/delegation/:id    Revoke delegation
```

---

## 14. Roadmap & Phases

### Phase 0: Foundation (Day 1–2, March 13–14) ✅ COMPLETE

**Goal:** Contracts + interfaces + project scaffolding

| Task | Status | Owner |
|------|--------|-------|
| Initialize Foundry project | ✅ | Agent |
| Implement IEIP8183AgenticCommerce interface | ✅ | Agent |
| Implement IIdentityVerifier interface | ✅ | Agent |
| Create NullVerifier (default) | ✅ | Agent |
| Write EscrowRail.sol (ERC-8183 compliant) | ✅ | Agent |
| Unit tests for all state transitions | ✅ | Agent |
| Architecture V2 doc | ✅ | Agent |
| Idea + strategy docs | ✅ | Human + Agent |
| Hackathon info doc | ✅ | Human + Agent |

### Phase 1: Core Pipeline (Day 3–4, March 15–16)

**Goal:** End-to-end happy path works on testnet

| Task | Priority | Owner | Est. Hours |
|------|----------|-------|------------|
| EscrowRailERC20.sol (ERC-20 variant for cUSD) | P0 | Agent | 3h |
| DealRailHook.sol (reputation + delegation gates) | P0 | Agent | 4h |
| Deploy to Base Sepolia | P0 | Agent | 1h |
| Deploy to Celo Sepolia | P0 | Agent | 1h |
| Backend scaffolding (Express + TypeScript) | P0 | Agent | 3h |
| Contract event listener | P0 | Agent | 2h |
| Basic job lifecycle API endpoints | P0 | Agent | 4h |
| x402n API client (bridge to Kairen) | P1 | Agent | 3h |
| ERC-8004 integration (register + verify) | P1 | Agent | 4h |
| Basic frontend (deal pipeline view) | P1 | Agent | 4h |

**Checkpoint:** By end of March 16, a deal can be created, funded, submitted, and completed on Base Sepolia with events visible in the frontend.

### Phase 2: Sponsor Integrations (Day 5–6, March 17–18)

**Goal:** All 10 sponsor integrations functional before mid-hack feedback

| Task | Priority | Owner | Est. Hours |
|------|----------|-------|------------|
| MetaMask Delegation integration | P0 | Agent | 4h |
| BankrBot payment integration | P0 | Agent | 3h |
| ERC-8004 reputation hooks (post-settlement) | P0 | Agent | 3h |
| Locus MCP payment integration | P1 | Agent | 2h |
| Uniswap API post-settlement swap | P1 | Agent | 3h |
| ENS name registration + resolution | P1 | Agent | 2h |
| AgentCash x402 gateway | P2 | Agent | 2h |
| Arkhai escrow extension docs | P2 | Agent | 1h |
| Policy dashboard UI (delegation editor) | P0 | Agent | 4h |
| Audit timeline UI component | P1 | Agent | 3h |

**Checkpoint (March 18 — MID-HACK FEEDBACK):** All sponsor integrations have at least minimal working state. AI judges provide feedback. Course-correct based on feedback.

### Phase 3: Demo & Polish (Day 7–8, March 19–20)

**Goal:** Polished demo, failure paths, documentation

| Task | Priority | Owner | Est. Hours |
|------|----------|-------|------------|
| Happy path demo flow (buyer→provider→evaluator) | P0 | Human + Agent | 4h |
| Failure path demo (reject + refund) | P0 | Agent | 2h |
| Demo script writing | P0 | Human | 2h |
| Demo video recording | P0 | Human | 3h |
| Frontend polish (visual pipeline, animations) | P1 | Agent | 4h |
| Celo mainnet deployment (if ready) | P1 | Agent | 1h |
| Base mainnet deployment (if ready) | P1 | Agent | 1h |
| Gather onchain artifacts (tx hashes, events) | P0 | Agent | 1h |
| Evaluator multi-signal verification logic | P1 | Agent | 3h |

### Phase 4: Submission (Day 9–10, March 21–22)

**Goal:** Complete submission bundle

| Task | Priority | Owner | Est. Hours |
|------|----------|-------|------------|
| README with run instructions | P0 | Agent | 2h |
| Integration guide for each sponsor | P0 | Agent | 3h |
| Conversation log (human-agent collaboration) | P0 | Human + Agent | 2h |
| Demo narrative document | P0 | Human | 1h |
| Final demo video (re-record if needed) | P0 | Human | 2h |
| Devfolio submission form | P0 | Human | 1h |
| Track selection (10 tracks) | P0 | Human | 0.5h |
| Code cleanup + final commit | P0 | Agent | 2h |
| Verify all onchain artifacts accessible | P0 | Agent | 1h |
| Pre-submission dry run | P0 | Human + Agent | 1h |

---

## 15. Checkpoints & Milestones

### Checkpoint 1: Contract Core (End of Day 2 — March 14) ✅

**Expectations:**
- EscrowRail.sol compiles and passes all state transition tests
- All 6 states testable (Open, Funded, Submitted, Completed, Rejected, Expired)
- Gas benchmarks captured
- Identity verifier interface + NullVerifier working

**Pass criteria:** `forge test` passes 100%, coverage > 90% on EscrowRail

### Checkpoint 2: Happy Path (End of Day 4 — March 16)

**Expectations:**
- Full deal lifecycle works on Base Sepolia: create → fund → submit → complete
- Backend API can trigger all contract functions
- Events captured and stored in database
- Basic UI shows deal state and timeline
- At least one real transaction on Base Sepolia testnet

**Pass criteria:** Can demonstrate a complete deal flow from API/UI with real testnet transactions. Block explorer links for every step.

### Checkpoint 3: Mid-Hack Ready (March 18 — AI Judge Feedback)

**Expectations:**
- All 10 sponsor integrations have at least a "proof of integration" — a working API call or contract interaction
- MetaMask Delegation actively gates fund() calls
- ERC-8004 reputation updates after settlement
- Celo deployment with cUSD settlement working
- UI dashboard shows policy bounds + deal pipeline
- BankrBot can execute payments
- Demo can run end-to-end (even if rough)

**Pass criteria:** AI judges from each sponsor track can verify their technology is meaningfully integrated. Receive feedback and identify gaps.

### Checkpoint 4: Demo Frozen (End of Day 8 — March 20)

**Expectations:**
- Happy path demo runs cleanly in under 90 seconds
- Failure path (reject + refund) demonstrated
- Demo video recorded (first cut)
- All mainnet deployments done (if planned)
- Onchain artifact list compiled (tx hashes, contract addresses, events)
- UI is polished and visually distinctive

**Pass criteria:** Demo can be shown to a non-technical person and they understand what's happening. All block explorer links work.

### Checkpoint 5: Submission Ready (March 22)

**Expectations:**
- All code committed and public
- README complete with setup/run instructions
- Demo video final cut (2–4 minutes)
- All 10 tracks selected on Devfolio
- Conversation log documents full build process
- No secrets in repository

**Pass criteria:** Devfolio submission form completed. All links verified. Repository clean.

---

## 16. Testing Strategy

### Smart Contract Testing

**Unit Tests (Foundry):**
- Every state transition in EscrowRail
- Every revert condition (wrong sender, wrong state, expired)
- Hook callbacks (beforeAction, afterAction)
- ERC-20 variant (EscrowRailERC20)
- Gas benchmarks for each function

**Integration Tests (Fork Testing):**
- Fork Base Sepolia and test against live ERC-8004 contracts
- Fork Celo Sepolia and test with real cUSD
- Full deal lifecycle with hooks enabled

**Target:** > 90% coverage, all edge cases documented

### Backend Testing

- API endpoint tests (happy path + error cases)
- Contract event listener tests
- x402n API client mock tests
- BankrBot integration tests (mocked)
- Delegation verification tests

### Frontend Testing

- Component rendering tests (deal pipeline, policy editor)
- Wallet connection flow
- Delegation creation UX
- State transition visualization

### End-to-End Testing

- Full deal flow: human sets policy → agent negotiates → escrow funded → delivered → settled
- Full failure flow: agent submits garbage → evaluator rejects → refund
- Timeout flow: no submission → expiry → claimRefund
- Multi-chain: same deal flow on Base and Celo

---

## 17. Demo Strategy

### Demo Video Structure (2–3 minutes)

**Opening Hook (15 seconds):**
"AI agents processed $600 million in payments last year through x402. Every single one was irreversible. If an agent pays for a service and gets garbage back, there's no recourse. Watch what happens when agents can actually negotiate, escrow, and verify."

**Part 1: Human Sets Policy (20 seconds):**
- Dashboard open → Configure delegation
- Show: spending cap ($50), approved counterparties (reputation ≥ 300), time window (24h)
- Sign delegation via MetaMask → onchain commitment

**Part 2: Agent Discovers & Negotiates (20 seconds):**
- Agent queries ERC-8004 registry → finds providers
- Posts RFO on x402n → receives 3 competing offers
- Auto-ranks by price/reputation → selects best within policy bounds

**Part 3: Onchain Commitment (20 seconds):**
- createJob() → show transaction on explorer
- fund() → escrow locked, show token transfer
- BankrBot executes payment, delegation caveats verified

**Part 4: Delivery & Verification (20 seconds):**
- Provider submits deliverable hash → show submit() transaction
- Evaluator verifies: hash match ✅, quality 0.92 ✅, SLA ✅
- complete() → settlement transaction, funds flow to provider

**Part 5: Reputation & Audit (15 seconds):**
- ERC-8004 reputation updated automatically via hook
- Full audit timeline shown in UI with block explorer links
- Reputation score visible on provider's ERC-8004 profile

**Part 6: Failure Case (20 seconds):**
- Second deal: provider submits garbage
- Evaluator rejects → reject() transaction
- Automatic refund to client
- Negative reputation written

**Closing (10 seconds):**
"DealRail — negotiate offchain, commit onchain, settle by proof. Built on ERC-8183 and ERC-8004. Deployed on Base and Celo. The trust layer the agent economy is missing."

### Demo Preparation Checklist

- [ ] Pre-fund all test wallets (ETH, USDC, cUSD on testnets)
- [ ] Pre-register agents in ERC-8004 registry
- [ ] Pre-configure MetaMask delegation
- [ ] Pre-seed provider agents with service listings
- [ ] Record backup video in case live demo breaks
- [ ] Test all block explorer links
- [ ] Prepare two demo scenarios (success + failure)
- [ ] UI designed as visual pipeline (NOT a chat interface — every project does chat)

---

## 18. Submission Checklist

### Product Completeness

- [ ] End-to-end happy path works (create → fund → submit → complete)
- [ ] Dispute/failure path demonstrable (submit → reject → refund)
- [ ] Expiry path works (no submission → claimRefund)
- [ ] Human policy boundaries enforceable (delegation + caveats)
- [ ] Multi-chain deployment (Base + Celo)

### Onchain Evidence

- [ ] Contracts deployed on Base Sepolia
- [ ] Contracts deployed on Celo Sepolia
- [ ] ERC-8004 agent registrations on Base Mainnet
- [ ] Real transactions executed (at least 5 deal lifecycles)
- [ ] Event timeline captured and linked to block explorer
- [ ] MetaMask delegation onchain

### Sponsor Integration Evidence

- [ ] ERC-8004: Registration + reputation writes with tx hashes
- [ ] Celo: Contract deployed + cUSD deal executed
- [ ] MetaMask: Delegation created + caveat enforcement shown
- [ ] Bankr: Payment executed via BankrBot API
- [ ] Uniswap: Post-settlement swap executed
- [ ] Locus: USDC payment via Locus MCP
- [ ] ENS: Agent names registered + resolution working
- [ ] AgentCash: x402 payment gateway used
- [ ] Arkhai: Evaluator pattern documented as escrow extension
- [ ] Open Track: Full project with 3-theme alignment

### Agent Quality

- [ ] Meaningful autonomous contribution shown (not wrapper)
- [ ] Safety guardrails documented (TX safety model)
- [ ] Irreversible actions confirm-gated (ESCALATE tier)
- [ ] Agent negotiates within bounds (not hardcoded)

### Documentation Quality

- [ ] Architecture doc (this PRD or ARCHITECTURE.md)
- [ ] README with run instructions
- [ ] Demo script
- [ ] Conversation log / collaboration narrative
- [ ] Integration guide for each sponsor
- [ ] Deployed contract addresses listed

### Open-Source Compliance

- [ ] Public repository on GitHub
- [ ] Build/test instructions (`forge test`, `npm run dev`)
- [ ] No API keys, secrets, or private keys in repo
- [ ] Meaningful commit history (no single large commits)

---

## 19. Risk Register & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Over-scope: too many integrations, none deep | HIGH | HIGH | Phase 2 has P0/P1/P2 priorities. Cut P2 if behind. Focus on 3 deep integrations over 10 shallow ones |
| BankrBot API unavailable or undocumented | MEDIUM | MEDIUM | Fallback: direct wallet interaction via ethers.js. BankrBot is nice-to-have, not blocking |
| x402n API not live or rate-limited | MEDIUM | HIGH | Fallback: mock x402n locally, demonstrate with pre-seeded negotiation data. Core value is the onchain escrow, not the offchain negotiation |
| MetaMask Delegation Toolkit complexity | MEDIUM | MEDIUM | Use starter repo (gator-nextjs-starter). Simplify caveats if needed |
| Celo deployment issues | LOW | MEDIUM | Celo is well-documented. Fallback: Base-only deployment covers most tracks |
| Demo breaks during recording | MEDIUM | HIGH | Always have a pre-recorded backup. Record demo on testnet where state is controlled |
| ERC-8183 reference implementation bugs | LOW | MEDIUM | Write own implementation based on spec (already done in V2 architecture) |
| AI judges don't understand the project | MEDIUM | HIGH | Clear demo narrative, visual UI pipeline, explicit mention of standards (ERC-8183, ERC-8004) |
| Single large commit looks suspicious | LOW | HIGH | Commit frequently with meaningful messages. Start from Day 1 |
| Team coordination overhead | MEDIUM | MEDIUM | This PRD is the single source of truth. Share with any new contributor or agent |

---

## 20. Glossary

| Term | Definition |
|------|-----------|
| **DealRail** | The project: machine-native deal execution rail for agent commerce |
| **ERC-8183** | Agentic Commerce Protocol — defines Job primitive with escrow, evaluator, and hook system |
| **ERC-8004** | Trustless Agents — onchain identity, reputation, and validation registries |
| **ERC-7710** | MetaMask Delegation standard for scoped permissions |
| **x402n** | Kairen's negotiation extension to x402 — adds RFO workflow and multi-round bidding |
| **x402** | HTTP 402 Payment Required protocol (Coinbase) — basic pay-per-request |
| **RFO** | Request for Offer — buyer posts requirements, providers submit competing bids |
| **EscrowRail** | The core smart contract implementing ERC-8183 |
| **DealRailHook** | IACPHook implementation for reputation gates and delegation checks |
| **Evaluator** | Agent or contract that verifies deliverable quality and triggers settlement |
| **Client** | The buyer agent (funds escrow, receives service) |
| **Provider** | The seller agent (delivers service, receives payment) |
| **Job** | ERC-8183 primitive: a unit of work with escrow, roles, and state machine |
| **Caveat** | MetaMask Delegation rule that constrains what the delegate can do |
| **cUSD** | Celo Dollar — stablecoin used for settlement on Celo |
| **USDC** | USD Coin — stablecoin used for settlement on Base |
| **ForgeID / SignetID** | Kairen's native identity system (part of L1 layer) |
| **Kairen Market** | Service discovery platform at market.kairen.xyz |
| **BankrBot** | LLM Gateway for agent wallet management and payments |
| **Locus** | AI agent payment infrastructure with MCP endpoint |
| **AgentCash** | x402 payment gateway by Merit Systems |
| **Alkahest** | Arkhai's natural-language-agreement escrow system |
| **Pinata** | IPFS pinning service for deliverable storage |
| **Celo Sepolia** | Celo testnet |
| **Base Sepolia** | Base testnet |

---

## Appendix A: Key External Links

| Resource | URL |
|----------|-----|
| Synthesis Hackathon | https://synthesis.md/ |
| Synthesis Themes | https://synthesis.devfolio.co/themes.md |
| Prize Catalog | https://synthesis.devfolio.co/catalog/prizes.md |
| Hackathon API | https://synthesis.devfolio.co/skill.md |
| ERC-8183 Spec | https://eips.ethereum.org/EIPS/eip-8183 |
| ERC-8004 Spec | https://eips.ethereum.org/EIPS/eip-8004 |
| ERC-8004 Contracts | https://github.com/erc-8004/erc-8004-contracts |
| Kairen Protocol | https://kairen.xyz/skill.md |
| x402n Protocol | https://x402n.kairen.xyz/skill.md |
| Kairen Market | https://market.kairen.xyz |
| MetaMask Delegation Toolkit | https://metamask.io/news/what-is-the-delegation-toolkit-and-what-can-you-build-with-it |
| MetaMask Starter Repo | https://github.com/MetaMask/gator-nextjs-starter |
| Locus MCP | https://paywithlocus.com/ |
| BankrBot API | https://api.bankr.bot |
| ERC-8183 Reference Impl | https://github.com/Virtual-Protocol/agent-commerce-protocol |
| Uniswap API | https://docs.uniswap.org |
| ENS | https://ens.domains |
| Celo | https://celo.org |
| Hackathon Telegram | https://nsb.dev/synthesis-updates |

---

## Appendix B: TX Safety Model

Pipeline for every state-changing transaction:

```
Preflight → Approval → Simulation → Broadcast → Settlement Check
```

Risk tiers:

| Tier | Actions | Policy |
|------|---------|--------|
| SAFE | Read-only queries, simulation, status checks | No confirmation needed |
| CAUTION | createJob, setBudget, submit | Agent confirms within policy bounds |
| ESCALATE | fund (transfers value), complete, reject | Requires delegation check; above-threshold amounts require human approval |

Hard rules:
- No unlimited token approvals
- No unverified addresses or contracts
- No state-changing tx without simulation first
- Mandatory gas estimation before broadcast
- All escalated actions must be human-approved or delegation-verified

---

*This PRD is the single source of truth for the Kairen DealRail hackathon project. Share with teammates, agents, or any contributor to provide full A-to-Z context.*

*Last updated: 2026-03-15*
