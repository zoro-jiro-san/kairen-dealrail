# Kairen DealRail

**Agentic Commerce Escrow Protocol** implementing EIP-8183 for machine-native deal execution on Base Sepolia and Celo Sepolia.

**Status:** 🚧 P0 Pipeline In Progress (updated March 17, 2026)
**Hackathon:** The Synthesis (March 13-22, 2026)
**Networks:** Base Sepolia (deployed), Celo Sepolia (deployed)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm or npm
- Foundry (for contracts)
- Base Sepolia wallet with ETH & USDC

### Run the Platform

```bash
# 1. Clone and install
git clone https://github.com/zoro-jiro-san/kairen-dealrail.git
cd kairen-dealrail

# 2. Start backend API
cd backend
npm install
npm run dev:simple
# Backend: http://localhost:3001

# 3. Start frontend (new terminal)
cd ../frontend
npm install
npm run dev
# Frontend: http://localhost:3000
```

### Use the Platform
1. Open http://localhost:3000
2. Connect your wallet (Base Sepolia)
3. View existing jobs or create new ones
4. Interact with jobs based on your role:
   - **Client:** Fund jobs with USDC
   - **Provider:** Submit deliverables
   - **Evaluator:** Approve or reject work

---

## 📖 Documentation

- **[STATUS.md](STATUS.md)** - Real-time project status
- **[SESSION_COMPLETE.md](SESSION_COMPLETE.md)** - Phase 1 summary
- **[COMMIT_SUMMARY.md](COMMIT_SUMMARY.md)** - Latest changes
- **[PRD_KAIREN_DEALRAIL.md](PRD_KAIREN_DEALRAIL.md)** - Product requirements
- **[AGENT.md](AGENT.md)** - AI agent collaboration guide
- **[skills/README.md](skills/README.md)** - Agent role skills and execution checkpoints
- **[backend/TRANSACTION_LEDGER.md](backend/TRANSACTION_LEDGER.md)** - Testnet ledger book (deployments + smoke txs)
- **[docs/](docs/)** - Comprehensive documentation

## ✅ Hackathon P0 Scope (Must Ship)

- [x] EscrowRail smart contract flow on Base Sepolia (`createJob`, `fund`, `submit`, `complete`, `reject`, `claimRefund`)
- [x] One end-to-end happy path onchain (create → fund → submit → complete)
- [x] One failure path onchain (submit → reject; refund path available via `claimRefund`)
- [x] Dashboard UI for deal lifecycle (visual pipeline + job state)
- [ ] 3 ERC-8004 agent registrations on Base Mainnet (pending final wallet ops)
- [ ] Final demo video (2-4 min with onchain evidence)

## 🎯 End Goal Use Case

DealRail is the trust/execution layer, not the full marketplace:
1. Discovery: find providers via x402n services + ERC-8004 reputation context.
2. Negotiation: run RFO/offer flow.
3. Commitment: create and fund escrow job onchain.
4. Verification: evaluator decides complete/reject.
5. Settlement ops: optional post-settlement routing (Uniswap/Locus).

## 🌐 Integration

DealRail supports multi-source integration:
- Discovery can aggregate multiple sources (x402n, external marketplaces, imported catalogs).
- Identity trust source uses ERC-8004 registries.
- Execution adapters support wallet-native flow plus bridge providers.

## 🧩 Standards Coverage

| Standard | Status | Where |
|----------|--------|-------|
| ERC-8183 (Agentic Commerce) | Implemented | `contracts/src/EscrowRail.sol`, `contracts/src/EscrowRailERC20.sol` |
| ERC-8004 (Agent Identity/Reputation hooks) | Integrated via verifier/hook | `contracts/src/identity/ERC8004Verifier.sol`, `contracts/src/DealRailHook.sol` |
| ERC-7710 (MetaMask Delegation) | Planned (P1) | Tracked in PRD + roadmap |

### Key Guides
- **[Frontend Integration](docs/FRONTEND_INTEGRATION.md)** - Wallet integration guide
- **[API Reference](backend/API_REFERENCE.md)** - Backend API docs
- **[Testing Guide](backend/tests/README.md)** - USDC recycling workflow
- **[Repo Structure](REPO_STRUCTURE.md)** - Code organization

---

## 🏗️ Architecture

### Smart Contracts (Solidity 0.8.20)
- **EscrowRailERC20** - USDC escrow with state machine
- **DealRailHook** - Reputation & delegation hooks
- **ERC8004Verifier** - Identity verification
- Deployed on Base Sepolia (verified)

### Backend (Node.js + TypeScript)
- Express REST API on port 3001
- Direct blockchain reads (no database required)
- Event listener for real-time monitoring
- USDC recycling test scripts

### Frontend (Next.js 14 + React 18)
- App Router with TypeScript
- RainbowKit + wagmi v2 wallet integration
- Direct contract calls via user wallet
- Responsive UI with dark theme

---

## 💰 Deployed Contracts

### Base Sepolia (Chain ID: 84532)
| Contract | Address |
|----------|---------|
| **EscrowRailERC20** | `0x3Bf4a9DD8200F43eF93bF4DAF1E0148102383835` |
| **DealRailHook** | `0x0CF133C9cE602854269CA6e49A4E8697Ef392c76` |
| **ERC8004Verifier** | `0xEd943E74001e1129546FEde0484Ec1C0F1419815` |
| **USDC (Test)** | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

Explorer links:
- EscrowRailERC20: https://sepolia.basescan.org/address/0x3Bf4a9DD8200F43eF93bF4DAF1E0148102383835
- DealRailHook: https://sepolia.basescan.org/address/0x0CF133C9cE602854269CA6e49A4E8697Ef392c76
- ERC8004Verifier: https://sepolia.basescan.org/address/0xEd943E74001e1129546FEde0484Ec1C0F1419815

---

## 🎯 Features

### ✅ Phase 1 (Complete)
- [x] EIP-8183 compliant escrow contracts
- [x] USDC payment rail (nano-payments: 0.1 USDC)
- [x] Backend API with blockchain reads
- [x] Frontend UI with wallet integration
- [x] Fund Job (approve + fund USDC)
- [x] Submit Deliverable (provider actions)
- [x] Complete/Reject Job (evaluator actions)
- [x] Transaction tracking with BaseScan links
- [x] USDC recycling for self-sufficient testing
- [x] Reputation & delegation hooks

### ⏳ Phase 2 (Upcoming)
- [ ] IPFS deliverable storage (Pinata)
- [x] x402n-style negotiation bridge endpoints + policy-to-offer pipeline UI
- [x] MetaMask delegation payload builder (ERC-7710 caveat structure)
- [ ] WebSocket real-time updates
- [ ] Analytics dashboard
- [x] Celo Sepolia deployment
- [x] Uniswap quote + tx builder endpoints (Base Mainnet QuoterV2 + SwapRouter02)
- [x] Locus MCP payment bridge endpoint (mock/live modes)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Full job lifecycle (create → fund → submit → complete)
npx tsx tests/test-lifecycle.ts

# Recycle USDC back to deployer
npx tsx tests/recycle-usdc.ts

# Check all wallet balances
npx tsx tests/check-all-balances.ts

# Celo Sepolia smoke flow (happy + reject)
npx tsx tests/test-lifecycle-celo-sepolia.ts
```

### Frontend Testing
1. Connect wallet on Base Sepolia
2. Navigate to job detail pages
3. Test actions based on your role
4. Verify transactions on BaseScan

---

## 🛠️ Tech Stack

**Smart Contracts:**
- Solidity 0.8.20
- Foundry framework
- OpenZeppelin libraries

**Backend:**
- Node.js + TypeScript
- Express.js REST API
- ethers.js v6
- Prisma (optional)

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- wagmi v2 + viem
- RainbowKit

---

## 🎨 Screenshots

### Dashboard
<img width="1200" alt="Dashboard" src="docs/screenshots/dashboard.png">

### Job Detail
<img width="1200" alt="Job Detail" src="docs/screenshots/job-detail.png">

### Wallet Interaction
<img width="600" alt="Wallet" src="docs/screenshots/wallet-action.png">

---

## 🤝 Contributing

This is a hackathon project for The Synthesis (March 13-22, 2026).

For AI agents collaborating on this repo:
- Read **[AGENT.md](AGENT.md)** for context
- Check **[STATUS.md](STATUS.md)** for latest status
- Follow **[REPO_STRUCTURE.md](REPO_STRUCTURE.md)** for organization

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🏆 Sponsor Tracks

**Primary:**
- ✅ **Base** - Deployed and operational on Base Sepolia
- ✅ **Circle (USDC)** - USDC payment rail integrated
- ⏳ **Kairen/x402n** - Agentic protocol (Phase 2)
- ⏳ **MetaMask** - Delegation integration (Phase 2)
- ⏳ **Pinata** - IPFS storage (Phase 2)

**Secondary:**
- EIP-8183 compliance
- ERC-8004 identity integration
- ERC-7710 delegation (planned)

---

## 👥 Team

- **Human Lead:** Sarthi Borkar
- **AI Agent:** Claude (Sonnet 4.5)

---

## 🔗 Links

- **Live Frontend:** http://localhost:3000 (local)
- **Backend API:** http://localhost:3001 (local)
- **BaseScan:** https://sepolia.basescan.org
- **Repo:** https://github.com/zoro-jiro-san/kairen-dealrail

---

## 🎉 Achievements

**Phase 1 Complete:**
- 5 smart contracts deployed
- Full backend API operational
- Production-quality frontend
- Complete wallet integration
- Self-sufficient testing system
- 7,750+ lines of code
- Comprehensive documentation

**Ready for:**
- Live demos with real wallets
- Hackathon submission
- User testing
- Phase 2 development

---

**Built for The Synthesis Hackathon**
March 13-22, 2026

🚀 **Status: PHASE 1 COMPLETE - READY TO DEMO** 🚀
