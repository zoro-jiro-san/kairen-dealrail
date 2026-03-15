# Kairen DealRail — Architecture Diagrams

> Visual architecture reference for hackathon development

---

## 1. System Overview (High-Level)

```mermaid
graph TB
    subgraph "DealRail Public Repo"
        UI[Next.js Frontend<br/>Wagmi + RainbowKit]
        API[Express Backend<br/>Node.js + Prisma]
        DB[(PostgreSQL<br/>Deals + Artifacts)]
        IPFS[IPFS Storage<br/>Pinata]

        subgraph "Base Blockchain"
            ESC[EscrowRail.sol<br/>State Machine]
            LOG[NegotiationLog.sol<br/>Artifact Ledger]
        end
    end

    subgraph "Optional: Kairen Protocol Integration"
        FORGE[ForgeID API<br/>Reputation]
        X402N[X402N API<br/>Service Discovery]
        MARKET[Market UI<br/>Deal Listings]
    end

    UI -->|REST/WebSocket| API
    API -->|ethers.js| ESC
    API -->|ethers.js| LOG
    API -->|Prisma ORM| DB
    API -->|Pin Proofs| IPFS

    API -.->|Optional| FORGE
    API -.->|Optional| X402N
    UI -.->|Optional| MARKET

    style UI fill:#3b82f6
    style API fill:#10b981
    style ESC fill:#8b5cf6
    style LOG fill:#8b5cf6
    style FORGE fill:#06b6d4,stroke-dasharray: 5 5
    style X402N fill:#06b6d4,stroke-dasharray: 5 5
    style MARKET fill:#06b6d4,stroke-dasharray: 5 5
```

---

## 2. Smart Contract State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATED: createDeal()

    CREATED --> FUNDED: fund() by buyer
    CREATED --> CANCELLED: cancel() by buyer

    FUNDED --> ACCEPTED: accept() by seller
    FUNDED --> CANCELLED: cancel() by buyer (refund)
    FUNDED --> EXPIRED: expire() after deadline

    ACCEPTED --> COMPLETED: release() by buyer
    ACCEPTED --> DISPUTED: dispute() by buyer or seller
    ACCEPTED --> EXPIRED: expire() after deadline

    DISPUTED --> RESOLVED: arbitrate() by arbitrator
    DISPUTED --> EXPIRED: expire() after extended deadline

    COMPLETED --> [*]
    RESOLVED --> [*]
    CANCELLED --> [*]
    EXPIRED --> [*]

    note right of CREATED
        Deal initialized
        No funds locked
    end note

    note right of FUNDED
        Buyer funds in escrow
        Seller can accept
    end note

    note right of ACCEPTED
        Both parties committed
        Awaiting delivery
    end note

    note right of COMPLETED
        Funds released to seller
        Settlement proof generated
    end note

    note right of DISPUTED
        Arbitrator intervention
        Evidence submission period
    end note
```

---

## 3. Deal Lifecycle Flow

```mermaid
sequenceDiagram
    actor Buyer
    actor Seller
    participant UI as Frontend
    participant API as Backend API
    participant Contract as EscrowRail.sol
    participant Log as NegotiationLog.sol
    participant IPFS

    %% Deal Creation
    Buyer->>UI: Create Deal (seller, amount, terms)
    UI->>Contract: createDeal()
    Contract-->>UI: DealCreated event (dealId)
    Contract->>API: Event listener picks up
    API->>API: Store in PostgreSQL

    %% Funding
    Buyer->>UI: Fund Escrow
    UI->>Contract: fund(dealId) + send ETH
    Contract-->>UI: DealFunded event
    Contract->>API: Event listener updates
    API->>API: State = FUNDED

    %% Negotiation Artifacts
    Buyer->>UI: Upload Terms Draft
    UI->>API: POST /deals/:id/artifacts
    API->>IPFS: Pin artifact content
    IPFS-->>API: CID returned
    API->>Log: anchor(dealId, contentHash, TERMS_DRAFT)
    Log-->>API: ArtifactAnchored event

    Seller->>UI: Review Terms
    Seller->>UI: Counter-Offer
    UI->>API: POST /deals/:id/artifacts
    API->>IPFS: Pin counter-offer
    API->>Log: anchor(dealId, contentHash, COUNTER_OFFER)

    %% Acceptance
    Seller->>UI: Accept Deal
    UI->>Contract: accept(dealId)
    Contract-->>UI: DealAccepted event
    Contract->>API: Event listener updates
    API->>API: State = ACCEPTED

    %% Delivery & Release
    Note over Buyer,Seller: ... service delivered ...

    Buyer->>UI: Upload Delivery Proof
    UI->>API: POST /deals/:id/artifacts
    API->>IPFS: Pin proof
    API->>Log: anchor(dealId, contentHash, EVIDENCE)

    Buyer->>UI: Release Funds
    UI->>Contract: release(dealId)
    Contract->>Contract: Transfer funds to seller
    Contract-->>UI: DealReleased event
    Contract->>API: Event listener triggered

    %% Settlement Proof
    API->>API: Generate SettlementProof JSON
    API->>API: Sign with EIP-712
    API->>IPFS: Pin proof
    IPFS-->>API: Proof CID
    API->>API: Store in SettlementProof table
    API->>UI: WebSocket: PROOF_READY

    UI->>Buyer: Display settlement proof
    Buyer->>UI: Download proof JSON
```

---

## 4. Integration Architecture (Kairen Protocol)

```mermaid
graph LR
    subgraph "DealRail (Public)"
        D[DealRail Core]
        IA[Identity Adapter]
        SA[Service Adapter]
        PA[Settlement Adapter]
    end

    subgraph "Kairen Protocol (Private)"
        FID[ForgeID<br/>Identity Layer]
        X[X402N<br/>Negotiation Layer]
        M[Market<br/>Discovery Layer]
    end

    D --> IA
    D --> SA
    D --> PA

    IA -.->|REST API| FID
    SA -.->|REST API| X
    PA -.->|REST API| M

    style D fill:#3b82f6
    style IA fill:#10b981
    style SA fill:#10b981
    style PA fill:#10b981
    style FID fill:#8b5cf6,stroke-dasharray: 5 5
    style X fill:#8b5cf6,stroke-dasharray: 5 5
    style M fill:#8b5cf6,stroke-dasharray: 5 5
```

**Adapter Pattern**:
- **Identity Adapter**: Verifies Forge Score (0-1000) before deal acceptance
- **Service Adapter**: Imports service listings from X402N catalog
- **Settlement Adapter**: Posts settlement proofs to Kairen audit log

**All adapters are**:
- Interface-based (no tight coupling)
- Environment-configurable (enable/disable via ENV)
- Gracefully degrading (DealRail works without them)

---

## 5. Data Flow: Settlement Proof Generation

```mermaid
flowchart TD
    A[DealReleased Event<br/>Emitted on-chain] --> B{Event Listener<br/>Detects}
    B --> C[Fetch Deal State<br/>from Contract]
    B --> D[Fetch All Artifacts<br/>from PostgreSQL]

    C --> E[Build SettlementProof<br/>JSON Object]
    D --> E

    E --> F{Proof Schema<br/>Valid?}
    F -->|No| G[Log Error]
    F -->|Yes| H[Sign with EIP-712<br/>Backend Hot Wallet]

    H --> I[Pin to IPFS<br/>via Pinata]
    I --> J{Pin<br/>Success?}

    J -->|No| K[Store in PostgreSQL<br/>Fallback]
    J -->|Yes| L[Store CID + Proof<br/>in SettlementProof Table]

    K --> M[WebSocket Push<br/>to Frontend]
    L --> M

    M --> N[User Downloads<br/>Proof JSON]

    style A fill:#8b5cf6
    style E fill:#10b981
    style I fill:#3b82f6
    style M fill:#06b6d4
```

**SettlementProof JSON Schema**:
```json
{
  "version": "1.0",
  "dealId": 123,
  "chainId": 84532,
  "contractAddress": "0x...",
  "finalState": "COMPLETED",
  "parties": {
    "buyer": "0x...",
    "seller": "0x..."
  },
  "amounts": {
    "total": "1000000000000000000",
    "buyerReceived": "0",
    "sellerReceived": "1000000000000000000"
  },
  "metadata": {
    "termsHash": "0x...",
    "settlementTxHash": "0x...",
    "settlementBlock": 12345678,
    "timestamp": 1710432000
  },
  "artifacts": [
    {
      "seq": 1,
      "kind": "TERMS_DRAFT",
      "contentHash": "0x...",
      "ipfsCid": "Qm..."
    }
  ],
  "signature": {
    "r": "0x...",
    "s": "0x...",
    "v": 27,
    "signer": "0x..."
  }
}
```

---

## 6. Technology Stack

```mermaid
graph TB
    subgraph "Frontend Layer"
        NX[Next.js 14<br/>App Router]
        WG[Wagmi v2<br/>Contract Hooks]
        RB[RainbowKit<br/>Wallet Connect]
        SH[shadcn/ui<br/>Components]
        TW[Tailwind CSS<br/>Styling]
    end

    subgraph "Backend Layer"
        EX[Express.js<br/>REST API]
        PR[Prisma ORM<br/>Database]
        ET[ethers.js v6<br/>Blockchain]
        WS[ws<br/>WebSocket]
    end

    subgraph "Storage Layer"
        PG[(PostgreSQL<br/>Relational DB)]
        IP[IPFS<br/>Pinata]
    end

    subgraph "Blockchain Layer"
        BC[Base Sepolia<br/>EVM Testnet]
        SC[Solidity Contracts<br/>Foundry]
    end

    NX --> WG
    NX --> RB
    NX --> SH
    NX --> TW

    EX --> PR
    EX --> ET
    EX --> WS

    PR --> PG
    EX --> IP
    ET --> BC

    WG --> BC

    style NX fill:#3b82f6
    style EX fill:#10b981
    style PG fill:#8b5cf6
    style BC fill:#06b6d4
```

---

## 7. Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Vercel"
            FE[Next.js Frontend<br/>dealrail.xyz]
        end

        subgraph "Railway/Render"
            BE[Express Backend<br/>api.dealrail.xyz]
            EL[Event Listener<br/>Background Worker]
            DB[(PostgreSQL<br/>Addon)]
        end

        subgraph "External Services"
            BASE[Base Sepolia RPC<br/>Alchemy + Infura]
            IPFS[IPFS<br/>Pinata Free Tier]
        end
    end

    FE -->|API Calls| BE
    FE -->|ethers.js| BASE
    BE -->|Prisma| DB
    BE -->|Events| BASE
    EL -->|Events| BASE
    BE -->|Pin| IPFS

    style FE fill:#3b82f6
    style BE fill:#10b981
    style BASE fill:#8b5cf6
    style IPFS fill:#06b6d4
```

**Environment Variables**:
```bash
# Frontend (Vercel)
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_API_URL=https://api.dealrail.xyz/v1

# Backend (Railway)
DATABASE_URL=postgresql://...
RPC_URL=https://base-sepolia.g.alchemy.com/v2/...
PRIVATE_KEY=0x...  # Proof signer (NOT arbitrator)
PINATA_JWT=...
ESCROW_ADDRESS=0x...
LOG_ADDRESS=0x...
```

---

## 8. Security Architecture

```mermaid
graph TB
    subgraph "Smart Contract Security"
        CEI[Checks-Effects-Interactions<br/>Pattern]
        RG[ReentrancyGuard<br/>OpenZeppelin]
        AC[Access Control<br/>Role-Based]
        TS[Typed State Machine<br/>Explicit Transitions]
    end

    subgraph "API Security"
        SIWE[Sign-In With Ethereum<br/>Authentication]
        JWT[JWT Tokens<br/>Session Management]
        RL[Rate Limiting<br/>DDoS Protection]
        VAL[Input Validation<br/>Zod Schemas]
    end

    subgraph "Data Security"
        CA[Content Addressing<br/>Tamper Detection]
        EIP[EIP-712 Signatures<br/>Proof Authenticity]
        IPFS[IPFS Pinning<br/>Immutable Storage]
        PG[Postgres<br/>Fallback + Audit]
    end

    subgraph "Fund Custody"
        NC[Non-Custodial<br/>Backend Never Holds Funds]
        EC[Escrow Contract<br/>Only Custody]
        DL[Deadline Enforcement<br/>Auto-Expiration]
        AR[Arbitration<br/>Dispute Resolution]
    end

    style CEI fill:#10b981
    style SIWE fill:#3b82f6
    style CA fill:#8b5cf6
    style NC fill:#06b6d4
```

**Security Invariants**:
1. **Backend never custodies funds**: Only EscrowRail.sol holds ETH/ERC20
2. **Artifacts are content-addressed**: Hash anchored on-chain prevents tampering
3. **All state transitions are access-controlled**: Only authorized roles can trigger
4. **Settlement proofs are signed**: EIP-712 signature ensures authenticity
5. **Deadlines are enforceable**: Anyone can call `expire()` post-deadline

---

## 9. Testing Pyramid

```mermaid
graph TB
    subgraph "Testing Strategy"
        E2E[E2E Tests<br/>Playwright + Wagmi<br/>5 critical paths]
        INT[Integration Tests<br/>API + Contract Interaction<br/>15 scenarios]
        FORK[Fork Tests<br/>Base Mainnet Fork<br/>USDC + Real RPC]
        FUZZ[Fuzz Tests<br/>Foundry Invariants<br/>50k iterations]
        UNIT[Unit Tests<br/>All Functions + Modifiers<br/>100+ tests]
    end

    E2E --> INT
    INT --> FORK
    FORK --> FUZZ
    FUZZ --> UNIT

    style E2E fill:#3b82f6
    style INT fill:#10b981
    style FORK fill:#8b5cf6
    style FUZZ fill:#06b6d4
    style UNIT fill:#f59e0b
```

**Test Coverage Goals**:
- Smart Contracts: >90% coverage (measured with `forge coverage`)
- Backend API: >80% coverage (Jest)
- Frontend: >70% coverage (React Testing Library)

**Critical Invariants (Fuzz Tests)**:
1. `escrow.balance == sum(deals.amount) for deals in {FUNDED, ACCEPTED}`
2. `deal.state` can only reach one terminal state
3. `funds never lost or double-spent`

---

## 10. Development Workflow

```mermaid
graph LR
    A[Local Anvil<br/>Chain] --> B[Contract Deploy<br/>forge script]
    B --> C[Backend Listener<br/>npm run dev]
    C --> D[Frontend Dev<br/>npm run dev]

    D --> E{Tests Pass?}
    E -->|No| F[Fix + Repeat]
    E -->|Yes| G[Deploy to<br/>Base Sepolia]

    G --> H[Backend to<br/>Railway]
    H --> I[Frontend to<br/>Vercel]

    I --> J[E2E Testing<br/>on Testnet]
    J --> K{Demo Ready?}
    K -->|No| F
    K -->|Yes| L[Record Video<br/>+ Submit]

    F --> A

    style A fill:#f59e0b
    style G fill:#3b82f6
    style L fill:#10b981
```

---

## 11. Kairen Ecosystem Integration (Optional Layer)

```mermaid
graph TB
    subgraph "DealRail Standalone Mode DEFAULT"
        D1[Deal Creation]
        D2[Escrow Funding]
        D3[Negotiation]
        D4[Settlement]
    end

    subgraph "Kairen-Enhanced Mode OPTIONAL"
        K1[ForgeID Verification<br/>Check Forge Score]
        K2[X402N Service Import<br/>Pre-fill from Catalog]
        K3[Market Listing<br/>Publish Deal]
        K4[Settlement Sync<br/>Post Proof to Kairen]
    end

    D1 -.->|ENV: IDENTITY_PROVIDER=forgeID| K1
    D1 -.->|ENV: KAIREN_API_URL set| K2
    D4 -.->|ENV: ENABLE_KAIREN_SYNC=true| K3
    D4 -.->|ENV: ENABLE_KAIREN_SYNC=true| K4

    K1 -.-> D1
    K2 -.-> D1
    K3 -.-> D4
    K4 -.-> D4

    style D1 fill:#3b82f6
    style D2 fill:#3b82f6
    style D3 fill:#3b82f6
    style D4 fill:#3b82f6
    style K1 fill:#8b5cf6,stroke-dasharray: 5 5
    style K2 fill:#8b5cf6,stroke-dasharray: 5 5
    style K3 fill:#8b5cf6,stroke-dasharray: 5 5
    style K4 fill:#8b5cf6,stroke-dasharray: 5 5
```

**Toggle Behavior**:
- **Standalone Mode** (default): All Kairen features disabled, DealRail fully functional
- **Kairen-Enhanced Mode**: Optional features enabled via ENV variables
- **Graceful Degradation**: If Kairen API unavailable, DealRail continues working

---

## Summary

These diagrams provide:
1. **System Overview**: How all components fit together
2. **State Machine**: Contract lifecycle visualization
3. **Sequence Flows**: Step-by-step deal execution
4. **Integration Architecture**: Clean separation between public DealRail and private Kairen
5. **Data Flows**: Settlement proof generation pipeline
6. **Tech Stack**: Framework and library choices
7. **Deployment**: Production environment architecture
8. **Security Model**: Multi-layer protection
9. **Testing Strategy**: Comprehensive coverage pyramid
10. **Development Workflow**: Local → Testnet → Production
11. **Kairen Integration**: Optional enhancement layer

Use these diagrams for:
- Hackathon presentation slides
- Judge explanations during demo
- Developer onboarding documentation
- Architecture decision records

---

**Next Steps**:
1. Review diagrams for accuracy
2. Export as PNG/SVG for presentation deck
3. Reference in README.md and ARCHITECTURE.md
4. Update as implementation progresses
