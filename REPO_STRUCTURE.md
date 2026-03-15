# DealRail Repository Structure

**Last Updated:** March 15, 2026

## 📁 Directory Overview

```
kairen-dealrail/
├── contracts/              # Foundry smart contracts
│   ├── src/               # Solidity contracts
│   │   ├── EscrowRail.sol
│   │   ├── EscrowRailERC20.sol (USDC/cUSD escrow)
│   │   ├── DealRailHook.sol (Reputation system)
│   │   └── identity/      # ERC-8004 verifiers
│   ├── script/            # Deployment scripts
│   ├── test/              # Foundry tests
│   └── foundry.toml
│
├── backend/               # Express + TypeScript API
│   ├── src/
│   │   ├── api/          # REST endpoints
│   │   │   └── jobs.routes.ts
│   │   ├── services/     # Business logic
│   │   │   ├── contract.service.ts
│   │   │   ├── event-listener.service.ts
│   │   │   ├── bankr.service.ts
│   │   │   └── ipfs.service.ts
│   │   ├── config.ts     # Multi-chain config
│   │   └── index.ts      # Server entry point
│   ├── tests/            # Integration tests ✨ NEW
│   │   ├── test-lifecycle.ts
│   │   ├── fund-wallets.ts
│   │   ├── complete-funded-jobs.ts
│   │   ├── recycle-usdc.ts
│   │   └── check-*.ts
│   ├── prisma/           # Database schema
│   └── package.json
│
├── frontend/             # Next.js UI
│   ├── app/             # App router
│   ├── components/      # React components
│   └── package.json
│
├── docs/                # Documentation
│   ├── architecture/    # Technical specs
│   ├── strategy/        # Hackathon planning
│   ├── progress/        # Daily logs
│   ├── guides/          # Setup & testing guides
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── TESTING_GUIDE.md ✨ NEW
│   │   └── MANUAL_SETUP_REQUIRED.md
│   └── reference/       # External resources
│
├── research/            # AI-generated research
│   ├── 01-research-brief.md
│   ├── 02-technical-blueprint.md
│   └── 03-tx-opinion.md
│
├── PRD_KAIREN_DEALRAIL.md      # Product Requirements
├── RESOURCES_DEALRAIL.md        # Curated resources
├── STATUS.md                    # Real-time status
├── PHASE1_SUMMARY.md            # Build summary
└── .gitignore                   # Security config
```

## 🔑 Key Files

### Smart Contracts
- **`contracts/src/EscrowRailERC20.sol`** - Main escrow contract (USDC/cUSD)
- **`contracts/src/DealRailHook.sol`** - Reputation & delegation hooks
- **`contracts/script/DeployBaseSepolia.s.sol`** - Base deployment

### Backend
- **`backend/src/services/contract.service.ts`** - Blockchain interaction layer
- **`backend/src/services/event-listener.service.ts`** - Real-time event monitoring
- **`backend/src/api/jobs.routes.ts`** - Job lifecycle REST API
- **`backend/tests/test-lifecycle.ts`** - Full end-to-end test

### Testing & Utilities
- **`backend/tests/fund-wallets.ts`** - Auto-fund agent & evaluator
- **`backend/tests/recycle-usdc.ts`** - Transfer USDC agent → deployer
- **`backend/tests/complete-funded-jobs.ts`** - Batch job completion
- **`backend/tests/check-all-balances.ts`** - Wallet balance viewer

### Documentation
- **`STATUS.md`** - Current build status (for collaborating agents)
- **`docs/guides/TESTING_GUIDE.md`** - USDC recycling workflow
- **`docs/guides/DEPLOYMENT_GUIDE.md`** - Deployment instructions

## 🚦 Getting Started

### 1. Install Dependencies
```bash
# Contracts
cd contracts && forge install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Configure Environment
```bash
cp backend/.env.example backend/.env
# Add your API keys and private keys
```

### 3. Run Tests
```bash
cd backend

# Fund test wallets
npx tsx tests/fund-wallets.ts

# Run full lifecycle test
npx tsx tests/test-lifecycle.ts

# Recycle USDC
npx tsx tests/recycle-usdc.ts
```

### 4. Start Development Server
```bash
cd backend
npm run dev
```

## 📊 Current Deployment

### Base Sepolia Testnet
- **Escrow Contract:** `0x53d368b5467524F7d674B70F00138a283e1533ce`
- **Hook Contract:** `0x61B73b679E3BE2256dAa90A3c37E10AEacD8a9Cc`
- **USDC Token:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Explorer:** https://sepolia.basescan.org

### Test Wallets
- **Deployer:** `0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e`
- **Agent:** `0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF`
- **Evaluator:** `0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2`

## 🔒 Security Notes

- `.env` files are gitignored
- `.wallets.json` is gitignored
- All broadcast JSONs (except mainnet) are excluded
- Private keys never committed to repo

## 📝 Development Workflow

1. **Build contracts:** `cd contracts && forge build`
2. **Deploy to testnet:** `forge script script/DeployBaseSepolia.s.sol --broadcast`
3. **Update backend config:** Add deployed addresses to `backend/src/config.ts`
4. **Test lifecycle:** Run `npx tsx tests/test-lifecycle.ts`
5. **Recycle funds:** Run `npx tsx tests/recycle-usdc.ts`
6. **Repeat testing:** Use recycled USDC for continuous testing

## 🎯 Next Steps

- [ ] Complete Celo Alfajores deployment
- [ ] Build frontend UI for deal pipeline
- [ ] Integrate Prisma database
- [ ] Add x402n negotiation protocol
- [ ] Implement IPFS deliverable storage
- [ ] Add BankrBot payment integration

---

**Built for The Synthesis Hackathon (March 13-22, 2026)**
