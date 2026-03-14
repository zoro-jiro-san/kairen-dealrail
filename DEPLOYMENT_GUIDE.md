# Kairen DealRail - Deployment Guide

> Complete guide for deploying DealRail to production (Base Sepolia/Mainnet)

---

## Prerequisites

### 1. Node.js & Package Managers
- Node.js >= 20.0.0
- npm or yarn

### 2. Foundry (for smart contracts)
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 3. Database
- **PostgreSQL** (Supabase recommended for free tier)
- Get from: https://app.supabase.com

### 4. RPC Provider
- **Recommended**: Alchemy or Infura
- Get Base Sepolia RPC from: https://www.alchemy.com or https://www.infura.io

### 5. IPFS Storage
- **Pinata** free tier (1GB storage)
- Get JWT from: https://app.pinata.cloud

### 6. WalletConnect Project ID
- Get from: https://cloud.walletconnect.com
- Required for frontend wallet connection

---

## Deployment Steps

### Phase 1: Smart Contracts Deployment

#### Step 1: Set up environment
```bash
cd contracts
cp .env.example .env
```

Edit `.env`:
```bash
# Deployer private key (MUST have Base Sepolia ETH for gas)
PRIVATE_KEY=0x...

# Base Sepolia RPC
RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=...
```

#### Step 2: Build and test contracts
```bash
# Install dependencies
forge install

# Build
forge build

# Run tests
forge test -vvv

# Check gas usage
forge test --gas-report
```

#### Step 3: Deploy to Base Sepolia
```bash
# Deploy with NullVerifier (simple, no identity checks)
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify

# OR deploy with SignetID integration
VERIFIER_TYPE=signetid forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
```

**Important**: Save the deployed addresses from console output:
```
=== Deployment Summary ===
Network: 84532
Deployer: 0x...
Identity Verifier: 0x...
EscrowRail: 0x...  <-- SAVE THIS
```

The deployment info will be saved to `contracts/deployments/84532.json`.

---

### Phase 2: Backend API Deployment

#### Step 1: Database Setup (Supabase)

1. Create project at https://app.supabase.com
2. Go to **Settings** → **Database**
3. Copy the **Connection String** (URI format)
4. Save for later: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### Step 2: Backend Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```bash
# Database (from Supabase)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Blockchain
RPC_URL="https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
CHAIN_ID=84532
ESCROW_ADDRESS="0x..."  # From contract deployment

# Private key for signing settlement proofs (can be different from deployer)
PRIVATE_KEY="0x..."

# BankrBot (optional for hackathon demo)
BANKR_API_KEY="bk_..."  # Get from BankrBot if available
BANKR_API_URL="https://api.bankr.bot"

# IPFS (Pinata)
PINATA_JWT="..."  # Get from https://app.pinata.cloud
PINATA_GATEWAY="https://gateway.pinata.cloud"

# Server
PORT=3000
NODE_ENV="production"

# Identity (optional - use SignetID address if deployed with it)
IDENTITY_VERIFIER_ADDRESS="0x..."
COURT_ACCESS_ADDRESS="0x251026B235Ab65fBC28674984e43F6AC9cF4d79A"
```

#### Step 3: Deploy Database Schema

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Verify with Prisma Studio (optional)
npm run db:studio
```

#### Step 4: Deploy Backend (Railway / Render)

**Option A: Railway**
1. Go to https://railway.app
2. Click **New Project** → **Deploy from GitHub**
3. Select your repo and `backend` folder
4. Add environment variables from `.env`
5. Set **Start Command**: `npm run build && npm start`
6. Deploy

**Option B: Render**
1. Go to https://render.com
2. Click **New** → **Web Service**
3. Connect GitHub repo
4. Set **Root Directory**: `backend`
5. Set **Build Command**: `npm install && npm run build`
6. Set **Start Command**: `npm start`
7. Add environment variables
8. Create Web Service

**Save the deployed API URL**: `https://your-backend.railway.app` or similar

---

### Phase 3: Frontend Deployment

#### Step 1: Frontend Environment Variables

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```bash
# Backend API URL (from Phase 2 deployment)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Chain ID
NEXT_PUBLIC_CHAIN_ID=84532

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

#### Step 2: Update Contract Address in Frontend

Edit `frontend/src/config/contracts.ts` (if it exists) or create it:
```typescript
export const ESCROW_ADDRESS = '0x...' // From contract deployment
export const CHAIN_ID = 84532
```

#### Step 3: Deploy to Vercel

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Or via Vercel Dashboard:
1. Go to https://vercel.com
2. **New Project** → Import from GitHub
3. Select repository
4. Set **Root Directory**: `frontend`
5. Add environment variables from `.env.local`
6. Deploy

**Save the deployed URL**: `https://your-app.vercel.app`

---

## Post-Deployment Verification

### 1. Test Backend Health
```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-14T...",
  "blockchain": {
    "chainId": 84532,
    "escrowAddress": "0x..."
  }
}
```

### 2. Test Frontend
1. Visit `https://your-app.vercel.app`
2. Connect wallet (use MetaMask with Base Sepolia network)
3. Verify you can see the UI

### 3. Test Event Listener
Check backend logs for:
```
✅ Database connected
✅ Event listener started from block: latest
✅ DealRail API server running on port 3000
```

### 4. Create Test Job
1. Use frontend to create a job
2. Check backend logs for event processing
3. Verify job appears in database (use Prisma Studio)

---

## Network Configuration

### Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://portal.cdp.coinbase.com/products/faucet

### Base Mainnet (Production)
- **Chain ID**: 8453
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- Update `CHAIN_ID` in all `.env` files to `8453`

---

## Troubleshooting

### Contract Deployment Fails
- **Issue**: Insufficient gas
- **Solution**: Fund deployer wallet with Base Sepolia ETH from faucet

### Backend Can't Connect to Database
- **Issue**: DATABASE_URL incorrect
- **Solution**: Verify connection string format from Supabase

### Event Listener Not Picking Up Events
- **Issue**: Wrong ESCROW_ADDRESS or RPC_URL
- **Solution**: Verify contract address matches deployment

### Frontend Can't Connect to Backend
- **Issue**: CORS or wrong API URL
- **Solution**: Verify NEXT_PUBLIC_API_URL and backend CORS settings

---

## Security Notes

### Production Checklist
- [ ] Never commit `.env` files to git
- [ ] Use separate private keys for deployer vs proof signer
- [ ] Enable 2FA on all service accounts (Vercel, Railway, Supabase)
- [ ] Use environment variables in deployment platforms (never hardcode)
- [ ] For mainnet: Get contracts audited
- [ ] Use multisig wallet for contract ownership
- [ ] Implement rate limiting on backend API
- [ ] Add monitoring (e.g., Sentry, LogRocket)

---

## Cost Estimates (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Supabase Database | Free | $0 |
| Railway/Render Backend | Hobby | $5-7 |
| Vercel Frontend | Free | $0 |
| Pinata IPFS | Free (1GB) | $0 |
| Base Sepolia Gas | Testnet | $0 |
| Alchemy RPC | Free (300M CU/mo) | $0 |
| **Total** | | **~$5-7/mo** |

For Base Mainnet, add gas costs (~$0.01-0.05 per transaction).

---

## Support

- **Contract Issues**: Check `contracts/test/*.t.sol` for examples
- **Backend Issues**: Check logs with `npm run dev` locally
- **Frontend Issues**: Check browser console and Next.js logs
- **Database Issues**: Use Prisma Studio to inspect data

---

*Last updated: 2026-03-14*
