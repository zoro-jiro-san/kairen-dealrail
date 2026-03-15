# Kairen DealRail — Architecture V2 (EIP-8183 Compliant)

> **Updated Architecture**: EIP-8183 Agentic Commerce + Multi-Provider Identity + BankrBot Payments

**Date**: 2026-03-14
**Status**: Pre-Development (Updated Requirements)
**Standards**: EIP-8183, ERC-8004, ethskills.com best practices

---

## Executive Summary

DealRail is now designed as an **EIP-8183 compliant agentic commerce protocol** with:
1. **Standards-Based Escrow**: Implements EIP-8183 state machine (Open → Funded → Submitted → Completed)
2. **Nano-Payments**: BankrBot integration for wallet management and payment execution
3. **Multi-Provider Identity**: Pluggable verification system (SignetID, ERC-8004, others)
4. **Kairen Ecosystem**: Optional integration with ForgeID, X402N

---

## Key Changes from V1

| Aspect | V1 (Original) | V2 (Updated) |
|--------|---------------|--------------|
| **Escrow Standard** | Custom state machine | **EIP-8183 compliant** |
| **Payment Layer** | Direct ETH/ERC20 transfers | **BankrBot nano-payments** |
| **Identity** | Optional ForgeID only | **Multi-provider pluggable** |
| **State Machine** | 8 states (custom) | **6 states (EIP-8183 spec)** |
| **Roles** | buyer, seller, arbitrator | **client, provider, evaluator** (EIP-8183 terms) |

---

## EIP-8183 Compliance

### State Machine (Specification)

```
Open ─────> Funded ─────> Submitted ─────> Completed ✓
  │            │              │
  ├─> Rejected │              │
  │            ├─> Rejected   │
  │            │              ├─> Rejected
  │            │              │
  └───────────┴──────────────┴─────────> Expired
```

**States**:
- `Open`: Job created, budget not yet set
- `Funded`: Budget escrowed, awaiting submission
- `Submitted`: Provider delivered work, awaiting evaluation
- `Completed`: Terminal; payment released
- `Rejected`: Terminal; refund to client
- `Expired`: Terminal; refund after timeout

**Roles**:
- `client`: Creates job, funds escrow, can reject in Open state
- `provider`: Submits work via `submit()`, receives payment on completion
- `evaluator`: Single trusted address; calls `complete()` or `reject()` after submission

### Core Functions (EIP-8183 Spec)

```solidity
// Required interface
interface IEIP8183AgenticCommerce {
    function createJob(
        address provider,
        address evaluator,
        uint256 expiry,
        address hook  // optional
    ) external returns (uint256 jobId);

    function fund(uint256 jobId, uint256 expectedBudget) external payable;

    function submit(uint256 jobId, bytes32 deliverable) external;

    function complete(uint256 jobId, bytes32 reason) external;

    function reject(uint256 jobId, bytes32 reason) external;

    function claimRefund(uint256 jobId) external;
}
```

**Events** (from spec):
```solidity
event JobCreated(uint256 indexed jobId, address client, address provider, address evaluator);
event JobFunded(uint256 indexed jobId, uint256 amount);
event JobSubmitted(uint256 indexed jobId, bytes32 deliverable);
event JobCompleted(uint256 indexed jobId, bytes32 reason);
event JobRejected(uint256 indexed jobId, bytes32 reason);
event JobExpired(uint256 indexed jobId);
```

---

## Multi-Provider Identity System

### Architecture

```
┌────────────────────────────────────────────────┐
│           DealRail Smart Contract              │
│                                                 │
│   ┌───────────────────────────────────────┐   │
│   │  IIdentityVerifier (Interface)        │   │
│   │  ─────────────────────────────────    │   │
│   │  verify(address) → VerificationResult│   │
│   └───────────────┬───────────────────────┘   │
│                   │                             │
│        ┌──────────┴──────────┬──────────┐     │
│        │                     │          │      │
│   ┌────▼────┐    ┌──────────▼───┐  ┌───▼────┐│
│   │ SignetID│    │  ERC-8004    │  │ Custom ││
│   │ Verifier│    │  Verifier    │  │ Provider││
│   └─────────┘    └──────────────┘  └────────┘│
│                                                 │
└────────────────────────────────────────────────┘

Configuration: Set via constructor or governance
Default: SignetID (ForgeID) on Base Sepolia
```

### IIdentityVerifier Interface

```solidity
// contracts/interfaces/IIdentityVerifier.sol
interface IIdentityVerifier {
    struct VerificationResult {
        bool isVerified;
        uint256 reputationScore;  // 0-1000
        string tier;              // "Squire", "Knight", "Duke", "Sovereign"
        bool isSuspended;
    }

    function verify(address agent) external view returns (VerificationResult memory);

    function verifierName() external view returns (string memory);
}
```

### Provider Implementations

#### 1. SignetIDVerifier (ForgeID)

```solidity
// contracts/identity/SignetIDVerifier.sol
contract SignetIDVerifier is IIdentityVerifier {
    ICourtAccess public courtAccess;

    constructor(address _courtAccess) {
        courtAccess = ICourtAccess(_courtAccess);
    }

    function verify(address agent) external view returns (VerificationResult memory) {
        (bool valid, uint8 rank, uint256 prestige) = courtAccess.verify(agent);

        string memory tier;
        if (rank == 0) tier = "Squire";
        else if (rank == 1) tier = "Knight";
        else if (rank == 2) tier = "Duke";
        else tier = "Sovereign";

        return VerificationResult({
            isVerified: valid,
            reputationScore: prestige,
            tier: tier,
            isSuspended: !valid
        });
    }

    function verifierName() external pure returns (string memory) {
        return "SignetID";
    }
}
```

#### 2. ERC8004Verifier (Generic)

```solidity
// contracts/identity/ERC8004Verifier.sol
contract ERC8004Verifier is IIdentityVerifier {
    IERC8004IdentityRegistry public registry;

    constructor(address _registry) {
        registry = IERC8004IdentityRegistry(_registry);
    }

    function verify(address agent) external view returns (VerificationResult memory) {
        // Check if agent has registered identity
        uint256 agentId = registry.agentIdOf(agent);
        bool isVerified = agentId > 0;

        // Get reputation from ERC-8004 reputation registry
        uint256 reputation = registry.getReputation(agentId);

        return VerificationResult({
            isVerified: isVerified,
            reputationScore: reputation,
            tier: _getTier(reputation),
            isSuspended: false  // ERC-8004 doesn't have suspension concept
        });
    }

    function _getTier(uint256 score) internal pure returns (string memory) {
        if (score >= 750) return "Elite";
        if (score >= 500) return "Verified";
        if (score >= 250) return "Registered";
        return "Novice";
    }

    function verifierName() external pure returns (string memory) {
        return "ERC-8004";
    }
}
```

#### 3. NullVerifier (No Verification)

```solidity
// contracts/identity/NullVerifier.sol
contract NullVerifier is IIdentityVerifier {
    function verify(address) external pure returns (VerificationResult memory) {
        return VerificationResult({
            isVerified: true,  // Always pass
            reputationScore: 500,  // Neutral score
            tier: "Unverified",
            isSuspended: false
        });
    }

    function verifierName() external pure returns (string memory) {
        return "None";
    }
}
```

### Configuration

```solidity
// In EscrowRail.sol (EIP-8183 implementation)
contract EscrowRail is IEIP8183AgenticCommerce {
    IIdentityVerifier public identityVerifier;

    constructor(address _identityVerifier) {
        identityVerifier = IIdentityVerifier(_identityVerifier);
    }

    function setIdentityVerifier(address _newVerifier) external onlyOwner {
        identityVerifier = IIdentityVerifier(_newVerifier);
        emit IdentityVerifierUpdated(_newVerifier);
    }

    // Use in job creation
    function createJob(...) external returns (uint256 jobId) {
        // Optional: Verify provider identity
        if (address(identityVerifier) != address(0)) {
            IIdentityVerifier.VerificationResult memory result =
                identityVerifier.verify(provider);

            require(!result.isSuspended, "Provider is suspended");

            // Optional: Require minimum reputation
            // require(result.reputationScore >= 300, "Insufficient reputation");
        }
        // ... rest of job creation
    }
}
```

---

## BankrBot Payment Integration

### Nano-Payments Architecture

```
┌───────────────────────────────────────────────┐
│  DealRail Frontend (Next.js)                  │
│  ┌─────────────────────────────────────────┐ │
│  │ User Action: "Fund Deal"                │ │
│  └──────────────┬──────────────────────────┘ │
│                 │                              │
│                 ▼                              │
│  ┌─────────────────────────────────────────┐ │
│  │ BankrBot SDK (Browser)                  │ │
│  │  - Natural language prompt              │ │
│  │  - "Fund escrow 0x... with 10 USDC"    │ │
│  └──────────────┬──────────────────────────┘ │
└─────────────────┼────────────────────────────┘
                  │
                  │ HTTPS
                  ▼
┌───────────────────────────────────────────────┐
│  BankrBot API (https://api.bankr.bot)        │
│  ┌─────────────────────────────────────────┐ │
│  │ POST /agent/prompt                      │ │
│  │ OR                                      │ │
│  │ POST /agent/submit (raw transaction)   │ │
│  └──────────────┬──────────────────────────┘ │
│                 │                              │
│                 │ Job Processing               │
│                 ▼                              │
│  ┌─────────────────────────────────────────┐ │
│  │ BankrBot Wallet                         │ │
│  │  - Signs transaction                    │ │
│  │  - Broadcasts to chain                  │ │
│  └──────────────┬──────────────────────────┘ │
└─────────────────┼────────────────────────────┘
                  │
                  │ RPC
                  ▼
┌───────────────────────────────────────────────┐
│  Base Blockchain                              │
│  ┌─────────────────────────────────────────┐ │
│  │ EscrowRail.sol (EIP-8183)               │ │
│  │  - fund(jobId, amount) called           │ │
│  │  - Funds locked in contract             │ │
│  └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

### Integration Options

#### Option 1: Natural Language (Recommended for MVP)

```typescript
// frontend/src/hooks/useBankrPayment.ts
import { BankrClient } from '@bankr/sdk';  // Hypothetical SDK

export function useBankrPayment() {
  const client = new BankrClient({ apiKey: process.env.NEXT_PUBLIC_BANKR_API_KEY });

  async function fundJob(jobId: number, amount: string) {
    const prompt = `Send ${amount} USDC to contract ${ESCROW_ADDRESS} calling fund(${jobId}, ${amount})`;

    const job = await client.prompt(prompt);

    // Poll for completion
    const result = await client.waitForJob(job.jobId);

    return result;
  }

  return { fundJob };
}
```

#### Option 2: Direct Transaction Submission (More Control)

```typescript
// frontend/src/hooks/useBankrTransaction.ts
import { BankrClient } from '@bankr/sdk';

export function useBankrTransaction() {
  const client = new BankrClient({ apiKey: process.env.NEXT_PUBLIC_BANKR_API_KEY });

  async function submitTransaction(tx: TransactionRequest) {
    // Build transaction
    const transaction = {
      to: ESCROW_ADDRESS,
      chainId: 84532,  // Base Sepolia
      data: encodeFunctionData({
        abi: EscrowRailABI,
        functionName: 'fund',
        args: [jobId, expectedBudget]
      }),
      value: expectedBudget
    };

    // Submit via BankrBot
    const result = await client.submit({
      transaction,
      waitForConfirmation: true
    });

    return result.txHash;
  }

  return { submitTransaction };
}
```

#### Option 3: Sign & Submit Separately

```typescript
// For more control: sign locally, submit via BankrBot
const signature = await client.sign({
  signatureType: 'eth_signTransaction',
  transaction: tx
});

const txHash = await client.submit({
  signedTransaction: signature,
  waitForConfirmation: true
});
```

### Environment Configuration

```bash
# .env (Backend)
BANKR_API_KEY=bk_...           # BankrBot API key (read-write)

# .env.local (Frontend)
NEXT_PUBLIC_BANKR_API_KEY=bk_...  # If using browser-side payments
# OR
# Use backend proxy for security (recommended)
```

---

## Updated Smart Contract Architecture

### Core Contract (EIP-8183 Compliant)

```solidity
// contracts/EscrowRail.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IEIP8183AgenticCommerce.sol";
import "./interfaces/IIdentityVerifier.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EscrowRail is IEIP8183AgenticCommerce, ReentrancyGuard, Ownable {
    enum State {
        Open,
        Funded,
        Submitted,
        Completed,
        Rejected,
        Expired
    }

    struct Job {
        address client;
        address provider;
        address evaluator;
        uint256 budget;
        uint256 expiry;
        State state;
        bytes32 deliverable;
        address hook;  // Optional EIP-8183 hook
    }

    mapping(uint256 => Job) public jobs;
    uint256 public nextJobId;

    IIdentityVerifier public identityVerifier;

    // EIP-8183 Events
    event JobCreated(uint256 indexed jobId, address client, address provider, address evaluator);
    event JobFunded(uint256 indexed jobId, uint256 amount);
    event JobSubmitted(uint256 indexed jobId, bytes32 deliverable);
    event JobCompleted(uint256 indexed jobId, bytes32 reason);
    event JobRejected(uint256 indexed jobId, bytes32 reason);
    event JobExpired(uint256 indexed jobId);

    constructor(address _identityVerifier) {
        identityVerifier = IIdentityVerifier(_identityVerifier);
    }

    function createJob(
        address provider,
        address evaluator,
        uint256 expiry,
        address hook
    ) external returns (uint256 jobId) {
        require(expiry > block.timestamp, "Expiry must be in future");

        // Optional: Verify provider identity
        if (address(identityVerifier) != address(0)) {
            IIdentityVerifier.VerificationResult memory result =
                identityVerifier.verify(provider);
            require(!result.isSuspended, "Provider is suspended");
        }

        jobId = nextJobId++;
        jobs[jobId] = Job({
            client: msg.sender,
            provider: provider,
            evaluator: evaluator,
            budget: 0,
            expiry: expiry,
            state: State.Open,
            deliverable: bytes32(0),
            hook: hook
        });

        emit JobCreated(jobId, msg.sender, provider, evaluator);
    }

    function fund(uint256 jobId, uint256 expectedBudget) external payable nonReentrant {
        Job storage job = jobs[jobId];
        require(job.state == State.Open, "Job not open");
        require(msg.sender == job.client, "Only client can fund");
        require(msg.value == expectedBudget, "Budget mismatch");

        job.budget = msg.value;
        job.state = State.Funded;

        emit JobFunded(jobId, msg.value);
    }

    function submit(uint256 jobId, bytes32 deliverable) external {
        Job storage job = jobs[jobId];
        require(job.state == State.Funded, "Job not funded");
        require(msg.sender == job.provider, "Only provider can submit");

        job.deliverable = deliverable;
        job.state = State.Submitted;

        emit JobSubmitted(jobId, deliverable);
    }

    function complete(uint256 jobId, bytes32 reason) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.state == State.Submitted, "Job not submitted");
        require(msg.sender == job.evaluator, "Only evaluator can complete");

        job.state = State.Completed;

        // Release payment to provider
        (bool success, ) = job.provider.call{value: job.budget}("");
        require(success, "Payment failed");

        emit JobCompleted(jobId, reason);
    }

    function reject(uint256 jobId, bytes32 reason) external nonReentrant {
        Job storage job = jobs[jobId];

        if (job.state == State.Open) {
            require(msg.sender == job.client, "Only client can reject open job");
        } else if (job.state == State.Funded || job.state == State.Submitted) {
            require(msg.sender == job.evaluator, "Only evaluator can reject");
        } else {
            revert("Cannot reject in this state");
        }

        job.state = State.Rejected;

        // Refund to client if funded
        if (job.budget > 0) {
            (bool success, ) = job.client.call{value: job.budget}("");
            require(success, "Refund failed");
        }

        emit JobRejected(jobId, reason);
    }

    function claimRefund(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(block.timestamp > job.expiry, "Not expired yet");
        require(job.state == State.Open || job.state == State.Funded, "Invalid state");

        job.state = State.Expired;

        // Refund to client if funded
        if (job.budget > 0) {
            (bool success, ) = job.client.call{value: job.budget}("");
            require(success, "Refund failed");
        }

        emit JobExpired(jobId);
    }

    function setIdentityVerifier(address _newVerifier) external onlyOwner {
        identityVerifier = IIdentityVerifier(_newVerifier);
    }
}
```

---

## Technology Stack (Updated)

### Smart Contracts
- **Standard**: EIP-8183 Agentic Commerce
- **Framework**: Foundry (Solidity 0.8.20+)
- **Libraries**: OpenZeppelin (ReentrancyGuard, Ownable)
- **Chain**: Base Sepolia (testnet) → Base Mainnet
- **Identity**: Multi-provider (SignetID, ERC-8004, custom)

### Backend
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Blockchain**: ethers.js v6
- **Payments**: BankrBot API integration

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Wallet**: Wagmi v2 + RainbowKit
- **Payments**: BankrBot SDK (or proxy via backend)
- **UI**: shadcn/ui + Tailwind CSS

### Infrastructure
- **RPC**: Alchemy (Base Sepolia)
- **IPFS**: Pinata (for deliverable storage)
- **Hosting**: Vercel (frontend), Railway (backend)

---

## Updated Roadmap (7 Days)

### Day 1: Foundation (EIP-8183 Interfaces)
- [ ] Initialize Foundry project
- [ ] Implement IEIP8183AgenticCommerce interface
- [ ] Implement IIdentityVerifier interface
- [ ] Create NullVerifier (default)
- [ ] Setup backend scaffolding with BankrBot types

### Day 2: Core Contracts
- [ ] Implement EscrowRail.sol (EIP-8183 compliant)
- [ ] Unit tests for all state transitions
- [ ] Gas benchmarks with `forge snapshot`

### Day 3: Identity Providers
- [ ] Implement SignetIDVerifier (ForgeID integration)
- [ ] Implement ERC8004Verifier (generic)
- [ ] Test identity verification flows
- [ ] Deploy to Base Sepolia with SignetIDVerifier

### Day 4: Backend + BankrBot Integration
- [ ] Backend API endpoints (job CRUD)
- [ ] BankrBot payment proxy (if needed)
- [ ] Event listener for contract events
- [ ] Settlement proof generation

### Day 5: Frontend
- [ ] Job creation UI
- [ ] BankrBot payment integration
- [ ] Job status dashboard
- [ ] Identity verification display

### Day 6: Deployment + Demo
- [ ] Deploy all contracts to Base Sepolia
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Record demo video

### Day 7: Polish + Submission
- [ ] Documentation (EIP-8183 compliance)
- [ ] Integration guide for BankrBot
- [ ] Multi-provider identity setup guide
- [ ] Hackathon submission

---

## Key Benefits of V2 Architecture

### 1. Standards Compliance
✅ **EIP-8183**: Interoperable with other agentic commerce systems
✅ **ERC-8004**: Compatible with agent identity registries
✅ **ethskills**: Following 2026 best practices

### 2. Flexibility
✅ **Multi-Provider Identity**: Not locked into single verification system
✅ **BankrBot**: Simplifies wallet management for agents
✅ **Pluggable Hooks**: EIP-8183 hook system for extensions

### 3. Production Ready
✅ **Low Gas Costs**: <1 gwei on Base (per ethskills)
✅ **Battle-Tested Standards**: EIP-8183 is proven design
✅ **Nano-Payments**: BankrBot handles small transactions efficiently

---

## Next Steps

1. **Review & Approve** this V2 architecture
2. **Gather Resources**: BankrBot API key (read-write access)
3. **Begin Day 1**: Initialize Foundry project with EIP-8183 interfaces

**Ready to build!** 🚀
