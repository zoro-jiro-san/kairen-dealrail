# ForgeID - Quick Reference Guide for DealRail Integration

## TL;DR

**ForgeID is a deployed AI agent identity + reputation protocol.**

- **EVM (Base Sepolia):** ✅ LIVE & READY TO USE
- **Solana:** 🟡 Code complete, build pending
- **Best for Hackathon:** Use EVM only
- **Integration Time:** 4-8 hours for basic agent verification

---

## Key Contracts (Base Sepolia)

```
SignetRing: 0x7e53afA534c0B487A5527426a5f4A9c414347df8  (ERC-721 NFT - Identity)
PrestigeOracle: 0xc1b214211710053dea6bE9F606D66FE80d2b514F  (Reputation scoring)
CourtAccess: 0x251026B235Ab65fBC28674984e43F6AC9cF4d79A  (Verification layer)
CourtTreasury: 0x9773Cd8134640254Bb25173EEd48786f4D525B12  (USDC payment handler)
```

---

## Core Features

### 1. Agent Identity (NFT)
- ERC-721 "Ring" token per agent
- 7-day free trial on mint
- Subscription: 5 USDC/month

### 2. Reputation Score
- Range: 0-1000 (starts at 500)
- Increases/decreases via attestations
- Weekly cap: ±150 points max

### 3. Ranks (from prestige + tenure)
```
SUSPENDED (0)    → Prestige < 400
SQUIRE (1)       → Prestige 400-599
KNIGHT (2)       → Prestige 600-699 + 30d tenure
DUKE (3)         → Prestige 700-849 + 90d tenure
SOVEREIGN (4)    → Prestige 850-1000 + 180d tenure + 5 attestations
```

### 4. Verification
```typescript
// Single function to check agent status
const { valid, rank, prestige } = await courtAccess.verify(agentWallet);
```

---

## SDK Integration (TypeScript)

### Installation
```bash
npm install @signet/evm-kit ethers
```

### Basic Usage
```typescript
import { SignetKit } from '@signet/evm-kit';

const signet = new SignetKit({ 
  chainId: 84532  // Base Sepolia
});

// Verify agent
const { valid, rank, prestige } = await signet.verify('0xAgent...');

// Check if valid
if (!valid) {
  console.log('Agent not registered');
}

// Check rank (1-4)
if (rank >= 2) {
  console.log('Agent is KNIGHT or higher');
}

// Get prestige score
console.log(`Agent prestige: ${prestige}/1000`);
```

---

## For DealRail: What to Build

### MVP (Hackathon - 4-6 hours)
```
1. ✅ Verify agents on deal execution
2. ✅ Block SUSPENDED agents
3. ✅ Display prestige badges in UI
4. ✅ Link to agent's Basescan NFT

Done! 🎉
```

### Phase 2 (Post-Hackathon - 6-8 hours)
```
1. Register DealRail as attestor
2. Submit +prestige after successful deals
3. Rank agents by prestige
4. Sort best agents first
```

### Phase 3 (Future - 10+ hours)
```
1. Require subscription to execute deals
2. Implement tiered deal access (KNIGHT+, DUKE+)
3. Show prestige progression over time
4. Create "reputation leaderboard"
```

---

## Code Examples for DealRail

### Verify Before Deal Execution
```typescript
async function executeDeal(deal, agentWallet) {
  const { valid, rank, prestige } = await signet.verify(agentWallet);
  
  if (!valid) {
    throw new Error('Agent not registered with ForgeID');
  }
  
  if (rank === 0) { // SUSPENDED
    throw new Error('Agent is suspended');
  }
  
  // Proceed with deal
  await processDeal(deal);
}
```

### Display Agent Info
```typescript
function AgentCard({ agent }) {
  const { rank, prestige } = await signet.verify(agent.wallet);
  
  const rankNames = ['SUSPENDED', 'SQUIRE', 'KNIGHT', 'DUKE', 'SOVEREIGN'];
  
  return (
    <div>
      <h3>{agent.name}</h3>
      <p>ForgeID Rank: {rankNames[rank]}</p>
      <p>Prestige: {prestige}/1000</p>
      <a href={`https://sepolia.basescan.org/nft/0x7e53afa534c0b487a5527426a5f4a9c414347df8/...`}>
        View on Basescan
      </a>
    </div>
  );
}
```

### Filter Top Agents
```typescript
async function getTopAgents(agents) {
  const enriched = await Promise.all(
    agents.map(async (a) => ({
      ...a,
      ...(await signet.verify(a.wallet))
    }))
  );
  
  return enriched
    .filter(a => a.valid) // Only registered
    .sort((a, b) => b.prestige - a.prestige) // By prestige
    .slice(0, 10); // Top 10
}
```

### Post-Deal Attestation (Phase 2)
```typescript
async function dealCompleted(deal) {
  // After successful deal...
  await prestigeOracle.submitAttestation(
    deal.agentWallet,
    +25 // Add prestige points (max ±50)
  );
  
  // Agent's score increases
  // Agent's rank may improve
}
```

---

## Architecture Diagram

```
DealRail Agent Manager
│
├─→ Verify Agent
│   └─→ CourtAccess.verify(wallet)
│       Returns: (valid, rank, prestige)
│
├─→ Display Status
│   └─→ Show: KNIGHT / Prestige 650 / Valid
│
├─→ Prevent Bad Agents
│   └─→ Block if SUSPENDED (rank 0)
│
└─→ After Deal Success (Phase 2)
    └─→ PrestigeOracle.submitAttestation(+25)
        Agent's prestige increases
```

---

## Important Notes

### Deployment
- **Testnet:** Base Sepolia (Chain 84532)
- **Production:** Base Mainnet (Chain 8453) - when ready
- **All contracts verified** on Basescan

### Wallet Support
- MetaMask ✅
- Coinbase Wallet ✅
- WalletConnect ✅
- Ledger ✅

### Costs (Testnet)
- Verification call: ~0.001 ETH
- Mint Ring: ~0.01 ETH
- No real money needed for hackathon

### Production Considerations
- Switch to Base Mainnet USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Register DealRail as official attestor (requires governance)
- Audit contracts before mainnet launch

---

## Testing on Sepolia

### Get Test Tokens
```bash
# ETH for gas
https://www.alchemy.com/faucets/base-sepolia

# USDC for subscriptions (manual)
# Or contact us for testnet USDC
```

### Verify Integration
```bash
# Check if you can verify an agent
curl https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=0x7e53afA534c0B487A5527426a5f4A9c414347df8&address=0xYourAddress&tag=latest

# View contract on Basescan
https://sepolia.basescan.org/address/0x7e53afA534c0B487A5527426a5f4A9c414347df8
```

---

## Docs & Resources

- **Full Analysis:** `FORGEID_INTEGRATION_ANALYSIS.md` (this repo)
- **Contract Code:** `/Users/sarthiborkar/Build/kairen-protocol/ForgeID/backend/contracts/src/`
- **EVM SDK:** `/Users/sarthiborkar/Build/kairen-protocol/ForgeID/backend/packages/signetkit-evm/`
- **Frontend Example:** `/Users/sarthiborkar/Build/kairen-protocol/ForgeID/frontend/web/`

---

## Support

For questions during integration:
1. Check the full analysis guide
2. Review contract ABIs in Basescan
3. Test with ForgeID's demo site
4. Contact ForgeID team

---

**Next Steps for Hackathon:**
1. Review this quick ref + full analysis
2. Install @signet/evm-kit in DealRail
3. Add verify() call in deal execution
4. Display prestige badges
5. Test on Base Sepolia
6. Demo to judges

**You got this!** 🚀
