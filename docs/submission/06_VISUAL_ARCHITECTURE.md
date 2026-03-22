# Visual Architecture

This file is the human-friendly visual explanation of how DealRail works.

Use this if you want the quickest visual understanding of the system without reading every implementation note.

## 1. One-Line Thesis

DealRail turns an agent deal into a verifiable execution loop:

```text
intent -> negotiation -> escrow -> evaluation -> settlement -> reputation
```

## 2. System Overview

```mermaid
flowchart LR
  subgraph Actors
    H[Human]
    B[Buyer Agent]
    P[Provider Agent]
    E[Evaluator Agent]
  end

  subgraph DealRail
    UI[Frontend]
    API[Backend API]
    NEG[x402n Negotiation]
    DISC[Discovery]
    ESC[Escrow Contracts]
    TRUST[ERC-8004 Trust Layer]
    ADAPT[Optional Execution Adapters]
  end

  subgraph Chains
    BASE[Base Sepolia]
    CELO[Celo Sepolia]
  end

  subgraph Extensions
    UNI[Uniswap]
    LOC[Locus]
    DEL[MetaMask Delegation Builder]
    X4[x402 / AgentCash Path]
  end

  H --> UI
  B --> UI
  P --> UI
  E --> UI

  UI --> API
  API --> NEG
  API --> DISC
  API --> ESC
  API --> TRUST
  API --> ADAPT

  DISC --> TRUST
  ESC --> BASE
  ESC --> CELO

  ADAPT --> UNI
  ADAPT --> LOC
  ADAPT --> DEL
  ADAPT --> X4
```

## 3. What Each Layer Does

| Layer | Purpose | Main Files |
|-------|---------|------------|
| Frontend | Operator and judge-facing UI | `frontend/src/app`, `frontend/src/components` |
| Backend | Lifecycle API and integration adapters | `backend/src/index-simple.ts`, `backend/src/services` |
| Escrow | Locks funds and enforces state transitions | `contracts/src/EscrowRail.sol`, `contracts/src/EscrowRailERC20.sol` |
| Trust layer | Checks identity/reputation and writes feedback | `contracts/src/DealRailHook.sol`, `contracts/src/identity/ERC8004Verifier.sol` |

## 4. Canonical Deal Flow

```mermaid
flowchart TD
  A[1. Buyer defines policy] --> B[2. Negotiation session created]
  B --> C[3. Providers ranked]
  C --> D[4. Buyer confirms one offer]
  D --> E[5. Onchain job created]
  E --> F[6. Escrow funded]
  F --> G[7. Provider submits deliverable]
  G --> H{8. Evaluator decision}
  H -->|Complete| I[9. Funds released]
  H -->|Reject| J[9. Job rejected]
  I --> K[10. Reputation feedback can be written]
  J --> L[10. Refund path remains available]
```

## 5. Trust Loop

This is the part that makes the Protocol Labs / ERC-8004 story strong.

```mermaid
flowchart LR
  REG[ERC-8004 identity registry] --> VER[ERC8004Verifier]
  REP[ERC-8004 reputation registry] --> VER
  VER --> DISC[discovery enrichment]
  VER --> HOOK[DealRailHook]
  HOOK --> FUND[allow or block action]
  SETTLE[successful settlement] --> HOOK
  HOOK --> FEED[write feedback to reputation registry]
```

## 6. What Is Actually Demonstrated

```mermaid
flowchart LR
  subgraph Strongly Demonstrated
    S1[Base Sepolia happy path]
    S2[Celo Sepolia happy path]
    S3[Celo Sepolia reject path]
    S4[ERC-8004 verifier and hook tests]
  end

  subgraph Partial But Present
    P1[MetaMask delegation builder]
    P2[Uniswap tx builder]
    P3[Locus bridge]
    P4[x402 and x402n adapters]
  end
```

## 7. Why The Repo Is Organized This Way

The repo is split so two audiences can navigate it quickly:

- humans need a simple visual story and direct evidence
- AI judges need structured markdown, exact file paths, tx hashes, and claim discipline

That is why:
- `docs/submission` is the canonical submission pack
- `backend/TRANSACTION_LEDGER.md` is the canonical proof log
- `STATUS.md` is the canonical deployment summary

## 8. Best Reading Order For Humans

1. [`00_START_HERE.md`](00_START_HERE.md)
2. [`06_VISUAL_ARCHITECTURE.md`](06_VISUAL_ARCHITECTURE.md)
3. [`01_TRACK_MATRIX.md`](01_TRACK_MATRIX.md)
4. [`03_EVIDENCE.md`](03_EVIDENCE.md)
5. [`05_WINNING_STRATEGY.md`](05_WINNING_STRATEGY.md)
