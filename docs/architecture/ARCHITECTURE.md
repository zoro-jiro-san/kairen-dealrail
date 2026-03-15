# Kairen DealRail — Architecture

> Hackathon build | Target: Base Sepolia | Stack: Solidity + Next.js + Node.js

---

## Overview

DealRail is an **on-chain escrow and negotiation rail** that lets two parties transact with trustless fund custody, an immutable negotiation log, and a cryptographically verifiable settlement proof.

```
+----------------+    REST/WS     +-----------------+   ethers.js   +------------------+
|  Next.js       | <-----------> |  DealRail API   | <-----------> |  EVM (Base)      |
|  Frontend      |               |  Express/Node   |               |  EscrowRail.sol  |
|  wagmi v2      |               |  Prisma + PG    |               |  NegotiationLog  |
+----------------+               +--------+--------+               +------------------+
                                          |
                                   +------+------+
                                   |  IPFS/      |
                                   |  Pinata     |
                                   +-------------+
```

---

## Core Contracts

### EscrowRail.sol
Central state machine. Holds funds in escrow through a typed lifecycle:

```
CREATED → FUNDED → ACCEPTED → COMPLETED
                ↘ DISPUTED → RESOLVED
CREATED/FUNDED → CANCELLED
```

- Native ETH + ERC20 variant (EscrowRailERC20.sol)
- Every transition is access-controlled and guarded by require(state == X)
- Re-entrancy protected via OpenZeppelin ReentrancyGuard
- Deadlines enforced by expire() callable by anyone post-deadline

### NegotiationLog.sol
Append-only, content-addressed ledger. Anchors keccak256 hashes of negotiation artifacts (terms drafts, counter-offers, evidence) keyed by dealId. Actual content lives off-chain on IPFS or Postgres.

---

## Backend

Runtime: Node.js 20 + Express
DB: PostgreSQL via Prisma ORM
Chain interface: ethers.js v6

### Responsibilities
1. REST API — deal metadata CRUD, artifact upload, proof serving
2. Event Listener — indexes all EscrowRail + NegotiationLog events; handles reorgs with fromBlock replay
3. Settlement Proof Generator — on DealReleased/DealResolved: builds SettlementProof JSON, EIP-712 signs, pins to IPFS
4. WebSocket — pushes state change events to connected frontend clients

### DB Schema (simplified)
```prisma
model Deal {
  id            Int       @id
  chainId       Int
  buyer         String
  seller        String
  arbitrator    String
  amount        String    // BigInt as string
  state         String
  termsHash     String
  artifacts     Artifact[]
  proof         SettlementProof?
}

model Artifact {
  id          Int      @id @default(autoincrement())
  dealId      Int
  seq         Int
  contentHash String
  kind        String
  author      String
  ipfsCid     String?
  blob        Bytes?
  deal        Deal     @relation(fields: [dealId], references: [id])
}

model SettlementProof {
  dealId      Int      @id
  proofJson   Json
  txHash      String
  createdAt   DateTime @default(now())
  deal        Deal     @relation(fields: [dealId], references: [id])
}
```

---

## Frontend

Stack: Next.js 14 (App Router) + Wagmi v2 + RainbowKit + shadcn/ui + Tailwind

### Page Routes
| Route | Component | Description |
|-------|-----------|-------------|
| / | Home | Landing + "Create Deal" CTA |
| /deals/new | CreateDeal | Form: seller, amount, terms upload |
| /deals/[id] | DealStatus | Live state + negotiation thread |
| /deals/[id]/settle | SettlementView | Proof viewer + download |

### Key Hooks
- useEscrow(dealId) — reads on-chain state + subscribes to WS events
- useCreateDeal() — wraps createDeal() + fund() tx sequence
- useArtifacts(dealId) — fetches + uploads negotiation artifacts

---

## Settlement Proof Flow

```
1. Buyer calls release() on-chain
2. Event listener picks up DealReleased(dealId)
3. Backend fetches final Deal state + all Artifacts from DB
4. Builds SettlementProof JSON
5. Signs with EIP-712 (backend hot wallet = proof issuer)
6. Pins proof JSON to IPFS via Pinata
7. Stores in DB with IPFS CID
8. WS push to frontend: { type: "PROOF_READY", proofCid: "..." }
9. Frontend renders SettlementView with download button
```

---

## Security Model

| Layer | Control |
|-------|---------|
| Contracts | CEI pattern, ReentrancyGuard, typed state machine, access modifiers |
| Arbitration | Trusted EOA for hackathon; upgrade path: multisig → dispute DAO |
| API Auth | SIWE (Sign-In With Ethereum) → JWT |
| Funds | Never custodied by backend; only smart contract holds ETH/ERC20 |
| Artifacts | Content-addressed; hash anchored on-chain; tampering detectable |

---

## Deployment

| Component | Target | Notes |
|-----------|--------|-------|
| Contracts | Base Sepolia | Deploy via forge script Deploy.s.sol |
| Backend | Railway / Render | Node.js, 1 dyno, Postgres addon |
| Frontend | Vercel | Next.js, auto-deploy from main |
| IPFS | Pinata free tier | 1GB — sufficient for hackathon |

### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://...
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=0x...          # proof signer (NOT arbitrator key)
PINATA_JWT=...
ESCROW_ADDRESS=0x...
LOG_ADDRESS=0x...

# Frontend
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_API_URL=https://api.dealrail.xyz/v1
```

---

## Out of Scope (Hackathon)

- Governance / token / DAO
- Multi-chain support
- Oracle price feeds
- ZK proofs for private negotiation
- Mobile app
- Production audits

These are post-hackathon extensions. Do not scope-creep into them.

---

## Local Dev Quick Start

```bash
# Contracts
cd contracts && forge install && forge build && forge test

# Backend (needs Postgres + Anvil)
cd backend && npm install
npx prisma migrate dev
npm run dev

# Frontend
cd frontend && npm install && npm run dev

# Local chain
anvil --chain-id 84532

# Deploy to Anvil
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

---

*Last updated: 2026-03-14 by Coder Agent (subagent)*
