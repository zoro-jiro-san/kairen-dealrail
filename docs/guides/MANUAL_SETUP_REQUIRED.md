# Manual Setup Requirements

> What YOU need to do manually before deployment

---

## 🔴 Critical - Required Before Any Deployment

### 1. Get Base Sepolia ETH (for deploying contracts)
**What**: Testnet ETH to pay for contract deployment gas
**Where**: https://portal.cdp.coinbase.com/products/faucet
**How**:
1. Go to the Coinbase faucet
2. Connect your wallet (deployer address)
3. Request Base Sepolia ETH
4. Wait ~1 minute for confirmation

**Amount needed**: ~0.01 ETH (covers deployment + testing)

---

### 2. Create Alchemy Account & Get RPC URL
**What**: RPC endpoint to interact with Base Sepolia blockchain
**Where**: https://www.alchemy.com
**How**:
1. Sign up for free account
2. Click **+ Create App**
3. Select:
   - **Chain**: Base
   - **Network**: Base Sepolia (testnet)
4. Copy the **HTTPS** endpoint URL
5. Format: `https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

**Save for**: `RPC_URL` in backend and contracts `.env`

**Alternative**: Use public RPC `https://sepolia.base.org` (but rate-limited)

---

### 3. Create Supabase Database
**What**: PostgreSQL database for storing jobs, artifacts, proofs
**Where**: https://app.supabase.com
**How**:
1. Sign up (free tier is fine)
2. Click **New Project**
3. Set project name (e.g., "dealrail-db")
4. Set strong database password (SAVE THIS)
5. Select region (choose closest to you)
6. Wait ~2 minutes for provisioning
7. Go to **Settings** → **Database**
8. Copy **Connection String** (URI format)
9. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres`

**Save for**: `DATABASE_URL` in backend `.env`

**Important**: Replace `[YOUR-PASSWORD]` with actual password from step 4

---

### 4. Create Pinata Account & Get JWT
**What**: IPFS storage for settlement proofs and artifacts
**Where**: https://app.pinata.cloud
**How**:
1. Sign up for free account
2. Go to **API Keys** in sidebar
3. Click **New Key**
4. Set permissions:
   - ✅ pinFileToIPFS
   - ✅ pinJSONToIPFS
5. Name it "dealrail-backend"
6. Click **Create Key**
7. Copy the **JWT** (starts with "eyJ...")
8. **IMPORTANT**: Save immediately (shown only once)

**Save for**: `PINATA_JWT` in backend `.env`

**Free tier**: 1GB storage (sufficient for hackathon)

---

### 5. Create WalletConnect Project ID
**What**: Required for frontend wallet connection
**Where**: https://cloud.walletconnect.com
**How**:
1. Sign up with GitHub/email
2. Click **Create Project**
3. Set project name (e.g., "DealRail")
4. Copy **Project ID**

**Save for**: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in frontend `.env.local`

---

### 6. Generate Private Keys

**You need TWO private keys**:

#### a) Contract Deployer Key
**What**: Wallet to deploy smart contracts (needs Base Sepolia ETH)
**How**:
```bash
# Option 1: Use existing wallet (export from MetaMask)
# Settings → Security & Privacy → Reveal Secret Recovery Phrase → Export Private Key

# Option 2: Generate new wallet with cast
cast wallet new
```

**Save for**: `PRIVATE_KEY` in `contracts/.env`

**Fund this address**: Use faucet from step 1

#### b) Proof Signer Key
**What**: Backend wallet to sign settlement proofs (doesn't need funds)
**How**:
```bash
cast wallet new
```

**Save for**: `PRIVATE_KEY` in `backend/.env`

**Security**: Keep these keys separate and NEVER commit to git

---

## 🟡 Optional - Nice to Have

### 7. BankrBot API Key (if integrating payments)
**What**: Payment processing for agent-to-agent transactions
**Where**: Contact BankrBot team or check their docs
**Status**: Optional for hackathon MVP

**Save for**: `BANKR_API_KEY` in backend `.env`

---

### 8. Etherscan API Key (for contract verification)
**What**: Verify contracts on BaseScan explorer
**Where**: https://basescan.org/myapikey
**How**:
1. Sign up
2. Go to **API Keys**
3. Click **+ Add** and create new key

**Save for**: `ETHERSCAN_API_KEY` in `contracts/.env`

**Benefit**: Makes contract code readable on BaseScan

---

## 📋 Checklist - What You Need to Provide

Before running deployment, ensure you have:

### For Contracts (`contracts/.env`)
- [ ] `PRIVATE_KEY` - Deployer wallet private key (funded with Base Sepolia ETH)
- [ ] `RPC_URL` - Alchemy Base Sepolia RPC URL
- [ ] `ETHERSCAN_API_KEY` - (optional) For contract verification

### For Backend (`backend/.env`)
- [ ] `DATABASE_URL` - Supabase PostgreSQL connection string
- [ ] `RPC_URL` - Same Alchemy RPC URL as contracts
- [ ] `CHAIN_ID` - `84532` (Base Sepolia)
- [ ] `ESCROW_ADDRESS` - (get this AFTER contract deployment)
- [ ] `PRIVATE_KEY` - Proof signer private key (no funds needed)
- [ ] `PINATA_JWT` - Pinata API JWT token
- [ ] `BANKR_API_KEY` - (optional) BankrBot API key

### For Frontend (`frontend/.env.local`)
- [ ] `NEXT_PUBLIC_API_URL` - (get this AFTER backend deployment)
- [ ] `NEXT_PUBLIC_CHAIN_ID` - `84532`
- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID

---

## 🚀 Deployment Order

1. **Get all manual items above** ✅
2. **Deploy contracts** → Save `ESCROW_ADDRESS`
3. **Deploy backend** → Save `API_URL`
4. **Deploy frontend** → Done!

---

## ⚠️ Security Reminders

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use different keys** - Deployer ≠ Proof Signer
3. **Save keys securely** - Use password manager (1Password, Bitwarden)
4. **Testnet first** - Test on Base Sepolia before mainnet
5. **No production keys in hackathon code** - Use separate keys for demo

---

## 💰 Cost Summary

| Item | Cost | Required |
|------|------|----------|
| Base Sepolia ETH | Free (faucet) | Yes |
| Alchemy RPC | Free tier | Yes |
| Supabase DB | Free tier | Yes |
| Pinata IPFS | Free tier (1GB) | Yes |
| WalletConnect | Free | Yes |
| BankrBot | TBD | No |
| **Total** | **$0** | |

**For production (Base Mainnet)**: Add ~$5-10/month for backend hosting + gas costs

---

## 🛟 Help & Support

### If you get stuck:

1. **Contract deployment fails**
   - Check you have Base Sepolia ETH: https://sepolia.basescan.org/address/YOUR_ADDRESS
   - Verify RPC_URL is correct
   - Try with `--legacy` flag if EIP-1559 errors

2. **Backend won't start**
   - Verify DATABASE_URL format is exactly right
   - Test connection: `npx prisma db push`
   - Check all env vars are set (no empty values)

3. **Frontend can't connect**
   - Verify WalletConnect Project ID is valid
   - Check NEXT_PUBLIC_API_URL points to deployed backend
   - Open browser console for errors

4. **"ESCROW_ADDRESS not set" error**
   - You must deploy contracts FIRST
   - Copy address from deployment output
   - Add to backend `.env`

---

*Ready to deploy? Follow `DEPLOYMENT_GUIDE.md` step-by-step!*
