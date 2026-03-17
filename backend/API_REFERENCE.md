# DealRail API Reference

**Base URL:** `http://localhost:3001`
**Status:** ✅ Running (Simplified Mode - No Database)

---

## Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-15T21:20:08.951Z",
  "blockchain": {
    "network": "baseSepolia",
    "chainId": 84532,
    "escrowAddress": "0x53d368b5467524F7d674B70F00138a283e1533ce",
    "usdcAddress": "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  }
}
```

---

## Get Job

**Endpoint:** `GET /api/v1/jobs/:jobId`

**Example:**
```bash
curl http://localhost:3001/api/v1/jobs/5
```

**Response:**
```json
{
  "jobId": 5,
  "client": "0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e",
  "provider": "0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF",
  "evaluator": "0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2",
  "budget": "0.1 USDC",
  "budgetRaw": "100000",
  "expiry": "2026-03-22T21:07:45.000Z",
  "state": "Completed",
  "stateCode": 3,
  "deliverable": "0x25fe56e2dc670473cb290567ccdcc13a93eac30141afde046328ddb035774423",
  "hook": "0x0000000000000000000000000000000000000000",
  "explorerUrl": "https://sepolia.basescan.org/address/..."
}
```

**State Codes:**
- `0` - Open
- `1` - Funded
- `2` - Submitted
- `3` - Completed
- `4` - Rejected
- `5` - Expired

---

## List Recent Jobs

**Endpoint:** `GET /api/v1/jobs?limit=24`

Returns recent onchain jobs in descending order by job ID.

---

## Create Job

**Endpoint:** `POST /api/v1/jobs`

**Request Body:**
```json
{
  "provider": "0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF",
  "evaluator": "0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2",
  "expiryDays": 7
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF",
    "evaluator": "0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2",
    "expiryDays": 7
  }'
```

**Response:**
```json
{
  "success": true,
  "jobId": 6,
  "txHash": "0x...",
  "explorerUrl": "https://sepolia.basescan.org/tx/0x..."
}
```

---

## Fund Job

**Endpoint:** `POST /api/v1/jobs/:jobId/fund`

**Request Body:**
```json
{
  "amount": "0.1"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/v1/jobs/6/fund \
  -H "Content-Type: application/json" \
  -d '{"amount": "0.1"}'
```

**Response:**
```json
{
  "success": true,
  "jobId": 6,
  "amount": "0.1 USDC",
  "txHash": "0x...",
  "explorerUrl": "https://sepolia.basescan.org/tx/0x..."
}
```

**Note:** Uses deployer private key from .env

---

## Submit Deliverable

**Endpoint:** `POST /api/v1/jobs/:jobId/submit`

**Request Body:**
```json
{
  "deliverable": "My completed work content",
  "providerPrivateKey": "0x..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/v1/jobs/6/submit \
  -H "Content-Type: application/json" \
  -d '{
    "deliverable": "Completed deliverable for job #6",
    "providerPrivateKey": "0xbc4d780784d2bcda1043ad58272aab996d19cc7e0aa3dc025c0cdbde7a01bad8"
  }'
```

**Response:**
```json
{
  "success": true,
  "jobId": 6,
  "deliverableHash": "0x...",
  "txHash": "0x...",
  "explorerUrl": "https://sepolia.basescan.org/tx/0x..."
}
```

---

## Complete Job

**Endpoint:** `POST /api/v1/jobs/:jobId/complete`

**Request Body:**
```json
{
  "reason": "Work approved - high quality",
  "evaluatorPrivateKey": "0x..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/v1/jobs/6/complete \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Excellent work, approved!",
    "evaluatorPrivateKey": "0x3e59deaa1b4eae55932c3c245d389bc7c0bbfb3836810202ad3098db21205e33"
  }'
```

**Response:**
```json
{
  "success": true,
  "jobId": 6,
  "reason": "Approved",
  "txHash": "0x...",
  "explorerUrl": "https://sepolia.basescan.org/tx/0x..."
}
```

---

## Reject Job

**Endpoint:** `POST /api/v1/jobs/:jobId/reject`

**Request Body:**
```json
{
  "reason": "Quality mismatch",
  "evaluatorPrivateKey": "0x..."
}
```

---

## Claim Refund

**Endpoint:** `POST /api/v1/jobs/:jobId/claim-refund`

**Request Body:**
```json
{
  "callerPrivateKey": "0x..."
}
```

---

## x402n Negotiation Bridge

### Create RFO
**Endpoint:** `POST /api/v1/x402n/rfos`

```json
{
  "serviceRequirement": "Generate benchmark report",
  "maxBudgetUsdc": 0.12,
  "maxDeliveryHours": 24,
  "minReputationScore": 700
}
```

### Get Negotiation
**Endpoint:** `GET /api/v1/x402n/rfos/:negotiationId`

### Accept Offer
**Endpoint:** `POST /api/v1/x402n/offers/:offerId/accept`

```json
{
  "negotiationId": "neg_1234abcd"
}
```

---

## Discovery

### List Discovery Sources
**Endpoint:** `GET /api/v1/discovery/sources`

### List Providers (multi-source)
**Endpoint:** `GET /api/v1/discovery/providers`

Optional params:
- `query`
- `minReputation`
- `maxBasePriceUsdc`
- `sources` (comma-separated: `x402n,virtuals,near,imported,mock`)

### Import External Providers
**Endpoint:** `POST /api/v1/discovery/providers/import`

Use this to ingest third-party marketplace exports into DealRail discovery.

### Agent Identity (ERC-8004)
**Endpoint:** `GET /api/v1/agents/:address`

---

## Uniswap Quote (Base Mainnet)

**Endpoint:** `GET /api/v1/integrations/uniswap/quote`

**Query params:**
- `tokenIn`: `USDC` or `WETH` (default `USDC`)
- `tokenOut`: `USDC` or `WETH` (default `WETH`)
- `amountIn`: human amount string (default `1`)
- `fee`: pool fee tier (default `3000`)

**Example:**
```bash
curl "http://localhost:3001/api/v1/integrations/uniswap/quote?tokenIn=USDC&tokenOut=WETH&amountIn=10&fee=3000"
```

---

## Uniswap Tx Builders

### Build Approve Tx
**Endpoint:** `POST /api/v1/integrations/uniswap/build-approve-tx`

```json
{
  "token": "USDC",
  "amount": "10"
}
```

### Build Swap Tx (exactInputSingle)
**Endpoint:** `POST /api/v1/integrations/uniswap/build-swap-tx`

```json
{
  "tokenIn": "USDC",
  "tokenOut": "WETH",
  "amountIn": "10",
  "amountOutMinimum": "0.001",
  "fee": 3000,
  "recipient": "0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e"
}
```

---

### Build Post-Settlement Approve+Swap (from Job)
**Endpoint:** `GET /api/v1/integrations/uniswap/post-settlement/:jobId`

Example:
```bash
curl "http://localhost:3001/api/v1/integrations/uniswap/post-settlement/12?tokenOut=WETH&fee=3000&slippageBps=300"
```

Requires job state = `Completed`.

---

## Locus MCP Bridge

### List Locus Tools
**Endpoint:** `GET /api/v1/integrations/locus/tools`

### Send USDC
**Endpoint:** `POST /api/v1/integrations/locus/send-usdc`

```json
{
  "fromAgentId": "buyer-agent",
  "toAddress": "0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF",
  "amountUsdc": "1",
  "chain": "base-sepolia",
  "memo": "DealRail hackathon payment"
}
```

---

## MetaMask Delegation (ERC-7710) Builder

### Build Delegation Payload
**Endpoint:** `POST /api/v1/integrations/metamask/delegation/build`

```json
{
  "delegator": "0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e",
  "delegate": "0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF",
  "escrowTarget": "0x53d368b5467524F7d674B70F00138a283e1533ce",
  "maxUsdc": "25",
  "expiryUnix": 1773780000,
  "allowedMethods": ["fund(uint256,uint256)", "createJob(address,address,uint256,address)"]
}
```

---

## Execution Adapters

### List Execution Providers
**Endpoint:** `GET /api/v1/execution/providers`

### Submit Execution Request
**Endpoint:** `POST /api/v1/execution/submit`

```json
{
  "provider": "wallet",
  "operation": "send-tx",
  "payload": {
    "to": "0x...",
    "data": "0x...",
    "value": "0",
    "chainId": 8453
  }
}
```

Providers currently exposed: `wallet`, `locus`, `bankr` (mock scaffold).

### Frontend Execution Notes

- The dashboard `Integration Workbench` can:
  - build Uniswap approve/swap tx payloads,
  - send those payloads through connected wallet,
  - build delegation caveats,
  - sign a delegation intent via EIP-712.

## Running the API

**Start server:**
```bash
cd backend
npm run dev:simple
```

**Server runs on:** `http://localhost:3001`

---

## Testing Workflow

```bash
# 1. Health check
curl http://localhost:3001/health | jq .

# 2. Get existing job
curl http://localhost:3001/api/v1/jobs/5 | jq .

# 3. Create new job
curl -X POST http://localhost:3001/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{"provider":"0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF","evaluator":"0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2","expiryDays":7}' \
  | jq .

# 4. Fund job (replace 6 with your jobId)
curl -X POST http://localhost:3001/api/v1/jobs/6/fund \
  -H "Content-Type: application/json" \
  -d '{"amount":"0.1"}' \
  | jq .

# 5. Submit deliverable (wait 3 seconds after funding)
sleep 3
curl -X POST http://localhost:3001/api/v1/jobs/6/submit \
  -H "Content-Type: application/json" \
  -d '{"deliverable":"Test deliverable","providerPrivateKey":"0xbc4d780784d2bcda1043ad58272aab996d19cc7e0aa3dc025c0cdbde7a01bad8"}' \
  | jq .

# 6. Complete job (wait 3 seconds after submit)
sleep 3
curl -X POST http://localhost:3001/api/v1/jobs/6/complete \
  -H "Content-Type: application/json" \
  -d '{"reason":"Approved","evaluatorPrivateKey":"0x3e59deaa1b4eae55932c3c245d389bc7c0bbfb3836810202ad3098db21205e33"}' \
  | jq .

# 7. Verify completion
curl http://localhost:3001/api/v1/jobs/6 | jq .
```

---

## Notes

**Current Mode:** Simplified (No Database)
- Reads jobs directly from blockchain
- No persistent storage
- Perfect for frontend development

**For Production:**
- Set up Supabase (see `docs/guides/SUPABASE_SETUP.md`)
- Use `npm run dev` instead of `npm run dev:simple`
- Database will cache jobs and enable advanced queries

---

**API Status:** ✅ Fully Operational
**Last Updated:** March 15, 2026
