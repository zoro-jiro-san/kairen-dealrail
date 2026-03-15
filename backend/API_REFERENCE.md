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
  "reasonHash": "0x...",
  "txHash": "0x...",
  "explorerUrl": "https://sepolia.basescan.org/tx/0x..."
}
```

---

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
