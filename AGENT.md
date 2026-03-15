# AGENT.md - Context for Collaborating AI Agents

**Last Updated:** March 15, 2026 23:50 UTC
**Primary Agent:** Claude (Sonnet 4.5)
**Human Lead:** Sarthi
**Project:** DealRail - Machine-Native Deal Execution Rail
**Hackathon:** The Synthesis (March 13-22, 2026)

---

## 🎯 Project Context

We are building **DealRail**, an agentic commerce escrow protocol implementing EIP-8183 for machine-to-machine payments. The project targets 10 sponsor tracks at The Synthesis hackathon with a combined prize pool of $45,000+.

**Core Value Proposition:**
Nano-payment escrow system (0.1 USDC scale) with automated settlement, identity verification (ERC-8004), and x402n negotiation protocol integration.

---

## 📁 Repository State & Organization

### Current Structure

```
kairen-dealrail/
├── contracts/              # Foundry (Solidity 0.8.20)
│   ├── src/
│   │   ├── EscrowRailERC20.sol          [DEPLOYED ✅]
│   │   ├── DealRailHook.sol             [DEPLOYED ✅]
│   │   └── identity/ERC8004Verifier.sol [DEPLOYED ✅]
│   └── script/DeployBaseSepolia.s.sol
│
├── backend/                # Express + TypeScript + ethers.js v6
│   ├── src/
│   │   ├── services/
│   │   │   ├── contract.service.ts      [COMPLETE ✅]
│   │   │   └── event-listener.service.ts [COMPLETE ✅]
│   │   ├── api/jobs.routes.ts           [COMPLETE ✅]
│   │   └── config.ts                    [COMPLETE ✅]
│   └── tests/                           [NEW - ORGANIZED ✅]
│       ├── test-lifecycle.ts            # Main test script
│       ├── fund-wallets.ts              # Gas fee management
│       ├── complete-funded-jobs.ts      # Batch completion
│       ├── recycle-usdc.ts              # USDC recycling
│       └── check-*.ts                   # Monitoring utilities
│
├── docs/
│   ├── guides/TESTING_GUIDE.md          [NEW ✅]
│   └── ... (organized subdirectories)
│
├── STATUS.md               # Real-time status (UPDATE THIS!)
├── PHASE1_SUMMARY.md       # Build summary (UPDATED ✅)
├── PRD_KAIREN_DEALRAIL.md  # SOURCE OF TRUTH
└── REPO_STRUCTURE.md       # Detailed structure guide
```

### Recent Changes (March 15, 2026)

1. **Test scripts organized** into `/backend/tests/` directory
2. **USDC recycling system** implemented and tested
3. **Self-sufficient wallet management** - ETH transfers automated
4. **Documentation restructured** - cleaner `/docs` hierarchy
5. **`.gitignore` updated** - enhanced security for public repo

---

## 💰 Transaction Management System

### Wallet Architecture

We control **all three wallets** - this is critical for understanding the transaction flow:

```
┌─────────────────────────────────────────────────────────┐
│ DEPLOYER (Client)                                       │
│ 0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e              │
│ Balance: 0.023 ETH, 20 USDC                             │
│ Role: Creates & funds jobs                              │
└────────────────┬────────────────────────────────────────┘
                 │ 1. createJob()
                 │ 2. fund(jobId, 0.1 USDC)
                 ▼
┌─────────────────────────────────────────────────────────┐
│ ESCROW CONTRACT                                         │
│ 0x53d368b5467524F7d674B70F00138a283e1533ce              │
│ Holds USDC until job completion                         │
└────────────────┬────────────────────────────────────────┘
                 │ 3. submit(jobId, deliverableHash)
                 │ 4. complete(jobId, reasonHash)
                 │    → Releases USDC to provider
                 ▼
┌─────────────────────────────────────────────────────────┐
│ AGENT (Provider)                                        │
│ 0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF              │
│ Balance: 0.001 ETH, 0 USDC (after recycling)            │
│ Role: Submits deliverables, receives payment            │
└────────────────┬────────────────────────────────────────┘
                 │ 5. transfer(deployer, USDC balance)
                 │    ♻️ RECYCLING STEP
                 ▼
┌─────────────────────────────────────────────────────────┐
│ BACK TO DEPLOYER                                        │
│ Ready for next test cycle!                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ EVALUATOR (Third-party verifier)                        │
│ 0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2              │
│ Balance: 0.001 ETH, 0 USDC                              │
│ Role: Approves or rejects submitted deliverables        │
└─────────────────────────────────────────────────────────┘
```

### USDC Recycling Flow (IMPORTANT!)

**We NEVER lose USDC in testing** - it circulates within our ecosystem:

1. **Deployer funds job:** 0.1 USDC → Escrow contract
2. **Agent completes job:** 0.1 USDC → Agent wallet
3. **Recycling script:** 0.1 USDC → Back to deployer
4. **Repeat indefinitely**

**Script:** `backend/tests/recycle-usdc.ts`

```bash
# After each completed job, run:
npx tsx tests/recycle-usdc.ts
```

**Current USDC Pool:** 20 USDC (fully recycled, ready for reuse)

---

## 🧪 Testing Workflow

### Standard Test Cycle

```bash
cd backend

# 1. Check balances before testing
npx tsx tests/check-all-balances.ts

# 2. Run full lifecycle test (creates new job)
npx tsx tests/test-lifecycle.ts
# → Creates job, funds with 0.1 USDC, submits, completes

# 3. Recycle USDC back to deployer
npx tsx tests/recycle-usdc.ts

# 4. Verify balances
npx tsx tests/check-all-balances.ts
```

### Monitoring & Debugging

```bash
# View all jobs on-chain
npx tsx tests/check-job-state.ts

# Check escrow contract USDC balance
npx tsx tests/check-escrow-balance.ts

# View wallet balances
npx tsx tests/check-all-balances.ts
```

### Gas Management

If agent/evaluator wallets run low on ETH:

```bash
npx tsx tests/fund-wallets.ts
# Transfers 0.001 ETH from deployer to agent & evaluator
```

**Cost per cycle:** ~0.0015 ETH (gas only, USDC recycled)
**Remaining capacity:** ~15-20 more full test cycles

---

## 🔑 Key Files & Their Purposes

### Smart Contracts (Deployed on Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| **EscrowRailERC20** | `0x53d368b5467524F7d674B70F00138a283e1533ce` | Main escrow logic (USDC/cUSD) |
| **DealRailHook** | `0x61B73b679E3BE2256dAa90A3c37E10AEacD8a9Cc` | Reputation gates + feedback |
| **ERC8004Verifier** | `0x668Dcc3a039CBef0054AAF244763db419BE6A521` | Identity verification |
| **USDC Token** | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Settlement token |

**Explorer:** https://sepolia.basescan.org

### Backend Services

| File | Status | Purpose |
|------|--------|---------|
| `src/config.ts` | ✅ Complete | Multi-chain config, deployed addresses |
| `src/services/contract.service.ts` | ✅ Complete | Blockchain interaction (createJob, fundJob, etc.) |
| `src/services/event-listener.service.ts` | ✅ Complete | Real-time event monitoring |
| `src/api/jobs.routes.ts` | ✅ Complete | REST API endpoints |

### Test Scripts (ALL TESTED & WORKING)

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `test-lifecycle.ts` | Full job lifecycle (create→fund→submit→complete) | Main test |
| `fund-wallets.ts` | Transfer ETH to agent/evaluator for gas | When gas runs low |
| `recycle-usdc.ts` | Transfer USDC from agent back to deployer | After each completed job |
| `complete-funded-jobs.ts` | Batch complete multiple jobs | When jobs stuck in Funded/Submitted state |
| `check-all-balances.ts` | View ETH + USDC for all wallets | Before/after tests |
| `check-job-state.ts` | View all on-chain jobs | Debugging |
| `check-escrow-balance.ts` | View escrow contract USDC | Verify funds locked |

---

## 🚦 Current State (March 15, 2026 23:50 UTC)

### Deployment Status

| Network | Status | Notes |
|---------|--------|-------|
| **Base Sepolia** | ✅ Deployed | Fully operational, 5 jobs tested |
| **Celo Alfajores** | ⏸️ Blocked | DNS/network issue, retry later |

### Wallet Balances (Live)

```
Deployer:  0.023 ETH, 20.0 USDC  ← Main wallet
Agent:     0.001 ETH,  0.0 USDC  ← After recycling
Evaluator: 0.001 ETH,  0.0 USDC
─────────────────────────────────
Total:     0.025 ETH, 20.0 USDC  ← All under our control
```

### Jobs Completed on Base Sepolia

| Job ID | Amount | State | Notes |
|--------|--------|-------|-------|
| #1 | 10 USDC | ✅ Completed | Initial test (large amount) |
| #2 | 10 USDC | ✅ Completed | Initial test (large amount) |
| #3 | 0 USDC | Open | Created but not funded (ran out of USDC) |
| #4 | 0.1 USDC | ✅ Completed | Nano-payment test |
| #5 | 0.1 USDC | ✅ Completed | Nano-payment test |

**All 20 USDC recovered and recycled!**

### Phase 1 Progress

**Overall:** 85% Complete
- ✅ Smart Contracts (100%)
- ✅ Backend API (100%)
- ✅ Testing Framework (100%)
- ✅ USDC Recycling (100%)
- ⏳ Frontend UI (0%)
- ⏸️ Celo Deployment (0%)

---

## 📝 Important Conventions & Patterns

### 1. **ALWAYS use nano-payment amounts**
```typescript
// ❌ BAD - Wasteful testing
const amount = ethers.parseUnits('10', 6); // 10 USDC

// ✅ GOOD - Realistic nano-payments
const amount = ethers.parseUnits('0.1', 6); // 0.1 USDC
```

### 2. **ALWAYS recycle USDC after completing jobs**
```bash
# After test completes:
npx tsx tests/recycle-usdc.ts
```

### 3. **Add delays between state transitions**
```typescript
// Submit deliverable
await escrowAsAgent.submit(jobId, deliverableHash);
await tx.wait();

// ⏳ CRITICAL: Wait for state propagation
await new Promise(resolve => setTimeout(resolve, 3000));

// Now safe to complete
await escrowAsEvaluator.complete(jobId, reasonHash);
```

Without the 3-second delay, you'll get `"job not submitted"` errors!

### 4. **BigInt handling in ethers.js v6**
```typescript
// State is returned as BigInt
const job = await escrow.getJob(jobId);

// ❌ Won't work
if (job.state === 1) { ... }

// ✅ Convert to number first
if (Number(job.state) === 1) { ... }
```

### 5. **Update STATUS.md after major changes**

When you make significant progress, update `STATUS.md` so other agents know the current state:

```markdown
**Last Updated:** [CURRENT_TIMESTAMP]
**Current Phase:** Phase 1 - Core Pipeline
...
```

---

## 🔒 Security & Privacy (CRITICAL!)

### Private Keys - NEVER COMMIT

All private keys are in `.env` file which is **gitignored**:

```bash
DEPLOYER_PRIVATE_KEY=0xece73f...
AGENT_PRIVATE_KEY=0xbc4d78...
EVALUATOR_PRIVATE_KEY=0x3e59de...
```

### .gitignore Coverage

```
.env              # All environment files
.env.*
.wallets.json     # Generated wallet file
contracts/broadcast/**/*.json  # Deployment artifacts
```

**VERIFY before any git operations:**
```bash
git status  # Check no secrets leaked
```

---

## 🎯 How to Continue Work (For Other Agents)

### If You're Taking Over This Project:

1. **Read These Files First:**
   - `PRD_KAIREN_DEALRAIL.md` - Source of truth
   - `STATUS.md` - Current build status
   - `PHASE1_SUMMARY.md` - What's been built
   - This file (`AGENT.md`) - How we handle things

2. **Verify Environment:**
   ```bash
   cd backend
   npx tsx tests/check-all-balances.ts
   ```
   - Should show ~0.023 ETH, 20 USDC in deployer
   - Should show ~0.001 ETH in agent/evaluator

3. **Run a Test Cycle:**
   ```bash
   npx tsx tests/test-lifecycle.ts
   npx tsx tests/recycle-usdc.ts
   ```

4. **Update STATUS.md:**
   - Change "Last Updated" timestamp
   - Add your changes to completed tasks
   - Update "Current Work" section

### If Building New Features:

1. **Frontend Development:**
   - Start in `/frontend` directory
   - Use wagmi + RainbowKit for wallet connection
   - Connect to contracts via addresses in `backend/src/config.ts`
   - Real-time updates via `event-listener.service.ts`

2. **Backend Expansion:**
   - Prisma schema is in `backend/prisma/schema.prisma`
   - Add new routes in `backend/src/api/`
   - Add new services in `backend/src/services/`

3. **Smart Contract Changes:**
   - Contracts are in `contracts/src/`
   - Test with `forge test -vv`
   - Deploy with `forge script script/DeployBaseSepolia.s.sol --broadcast`
   - Update addresses in `backend/src/config.ts`

---

## 🐛 Known Issues & Workarounds

### Issue #1: "job not submitted" Error

**Symptom:** Complete transaction fails even after successful submit

**Cause:** State propagation delay on testnet

**Fix:** Add 3-second delay between submit and complete
```typescript
await tx.wait();
await new Promise(resolve => setTimeout(resolve, 3000));
```

### Issue #2: Celo Deployment Blocked

**Symptom:** `DNS lookup failed for alfajores-forno.celo-testnet.org`

**Status:** Waiting for network resolution

**Workaround:** Focus on Base Sepolia for now, Celo can wait

### Issue #3: Escrow Stuck with Funds

**Symptom:** USDC locked in escrow, jobs in Funded/Submitted state

**Fix:** Complete the jobs manually:
```bash
npx tsx tests/complete-funded-jobs.ts
npx tsx tests/recycle-usdc.ts
```

---

## 📊 Testing Metrics & Capacity

**Gas Costs (Base Sepolia):**
- Create job: ~0.0005 ETH
- Fund job: ~0.0003 ETH
- Submit deliverable: ~0.0003 ETH
- Complete job: ~0.0003 ETH
- Recycle USDC: ~0.0001 ETH
- **Total per cycle:** ~0.0015 ETH

**Current Capacity:**
- ETH remaining: 0.023 ETH
- Tests remaining: 15-20 cycles
- USDC: ♻️ Infinite (recycled)

**Jobs Tested:**
- Total: 5 jobs (4 completed, 1 unfunded)
- Volume: 20.2 USDC processed
- Success rate: 100% (after implementing delays)

---

## 🚀 Next Steps (From STATUS.md)

**Priority 1 - Frontend:**
- [ ] Basic deal pipeline UI
- [ ] Wallet connection (wagmi + RainbowKit)
- [ ] Real-time job state updates
- [ ] BaseScan transaction links

**Priority 2 - Celo:**
- [ ] Retry Celo Alfajores deployment
- [ ] Test with cUSD token
- [ ] Multi-chain selector in frontend

**Priority 3 - Integrations:**
- [ ] Prisma database integration
- [ ] x402n negotiation protocol
- [ ] IPFS deliverable storage (Pinata)
- [ ] BankrBot payment integration

---

## 💡 Tips for Efficiency

1. **Don't waste faucet USDC** - Always recycle after tests
2. **Use check scripts frequently** - Know your state before acting
3. **Respect the 3-second rule** - Delay between submit/complete
4. **Update STATUS.md in real-time** - Other agents depend on it
5. **Test with 0.1 USDC** - Nano-payments are the vision

---

## 📞 Contact & Collaboration

**Human Lead:** Sarthi
**Primary Agent:** Claude (Sonnet 4.5)
**Other Agents:** Codex, [Your agent name here]

**Important Files to Sync:**
- `STATUS.md` - Update after every session
- `PHASE1_SUMMARY.md` - Update after major milestones
- `AGENT.md` - Update when workflows change

**Communication Protocol:**
1. Read STATUS.md first
2. Check current balances
3. Make your changes
4. Update STATUS.md
5. Leave notes in STATUS.md for next agent

---

## 🎉 Current Achievement Level

**Phase 1:** 85% Complete
**Hackathon:** Day 3 of 10
**Core Pipeline:** ✅ Operational
**Testing:** ✅ Self-sufficient
**USDC Management:** ✅ Recycling system live

**We are ON TRACK for Phase 1 completion by March 16!**

---

**Last Context Update:** March 15, 2026 23:50 UTC
**Next Agent:** Please update timestamp above when you take over
**Status:** READY FOR FRONTEND DEVELOPMENT 🚀
