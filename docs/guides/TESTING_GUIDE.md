# DealRail Testing Guide - Wallet Management

## Current Status

**Escrow Contract:** 20 USDC locked in 2 funded jobs
**Deployer:** 0.025 ETH, 0 USDC
**Agent:** 0 ETH, 0 USDC
**Evaluator:** 0 ETH, 0 USDC

## 🎯 Minimal Funding Needed

You only need to fund **gas fees** (no USDC needed):

```bash
# Send to Agent (for submitting deliverables)
Address: 0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF
Amount: 0.001 ETH

# Send to Evaluator (for approving jobs)
Address: 0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2
Amount: 0.001 ETH
```

## 🔄 USDC Recycling Flow

Once you fund the gas fees, here's how we recycle USDC:

1. **Complete Jobs #1 and #2** → 20 USDC flows from escrow to agent wallet
2. **Run recycling script** → Transfer USDC from agent back to deployer
3. **Test indefinitely** → Use 0.1 USDC per test, recycle after each completion

### Commands:

```bash
# Step 1: Complete existing jobs (after funding gas)
npx tsx complete-funded-jobs.ts

# Step 2: Recycle USDC back to deployer
npx tsx recycle-usdc.ts

# Step 3: Run new test with 0.1 USDC
npx tsx test-lifecycle.ts

# Step 4: Recycle again
npx tsx recycle-usdc.ts
```

## 💰 USDC Flow Diagram

```
Test Cycle:
┌─────────────────────────────────────────────┐
│ Deployer: 20 USDC                          │
└──────────────┬──────────────────────────────┘
               │ Fund job (0.1 USDC)
               ▼
┌─────────────────────────────────────────────┐
│ Escrow: 0.1 USDC (locked)                  │
└──────────────┬──────────────────────────────┘
               │ Complete job
               ▼
┌─────────────────────────────────────────────┐
│ Agent: 0.1 USDC (received)                 │
└──────────────┬──────────────────────────────┘
               │ Recycle (transfer back)
               ▼
┌─────────────────────────────────────────────┐
│ Deployer: 20 USDC (back to start!)        │
└─────────────────────────────────────────────┘
```

## 📊 Cost Per Test Cycle

- **USDC:** 0 (recycled)
- **Gas fees:** ~0.0015 ETH total
  - Create job: ~0.0005 ETH (deployer)
  - Fund job: ~0.0003 ETH (deployer)
  - Submit: ~0.0003 ETH (agent)
  - Complete: ~0.0003 ETH (evaluator)
  - Recycle: ~0.0001 ETH (agent)

**With 0.025 ETH total, you can run ~15-20 complete test cycles!**

## ✅ After Funding Gas Fees

Run this to verify everything is ready:

```bash
npx tsx check-all-balances.ts
```

You should see:
- Agent: >0 ETH ✅
- Evaluator: >0 ETH ✅
- Deployer: ~0.025 ETH ✅

Then start testing! 🚀
