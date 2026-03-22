# DealRail API Reference

## Base URLs

- Live: `https://kairen-dealrail-production.up.railway.app`
- Local: `http://localhost:3001`

## Important Public Safety Rule

The public API does not accept raw private keys.

Public write flows are:
- browser wallet signing
- `/api/v1/jobs/simulate` for transaction planning
- managed demo execution for demo jobs whose onchain participants match the server-managed demo actors

## Health

### `GET /health`

Returns:
- active chain
- escrow address
- stablecoin address
- public supported chain summaries
- machine-payments posture

Example:

```bash
curl https://kairen-dealrail-production.up.railway.app/health
```

## Chains

### `GET /api/v1/chains`

Returns:
- default chain
- public supported chain metadata

Example:

```bash
curl https://kairen-dealrail-production.up.railway.app/api/v1/chains
```

## Jobs

### `GET /api/v1/jobs`

List recent onchain jobs.

Example:

```bash
curl "https://kairen-dealrail-production.up.railway.app/api/v1/jobs?chain=baseSepolia&limit=5"
```

### `GET /api/v1/jobs/:jobId`

Read one job by onchain job ID.

Example:

```bash
curl https://kairen-dealrail-production.up.railway.app/api/v1/jobs/5
```

### `POST /api/v1/jobs`

Create a demo job using the server-managed client actor.

Request:

```json
{
  "provider": "0xef9C7E3Fea4f54CB3C6c8fa0978a0C8aB8f28fcF",
  "evaluator": "0xe872Bd6d99452C87BA54c7618FEc71f0DB23d4f2",
  "expiryDays": 7,
  "chain": "baseSepolia"
}
```

### `POST /api/v1/jobs/:jobId/fund`

Fund a demo job using the server-managed client actor.

Request:

```json
{
  "amount": "0.1",
  "chain": "baseSepolia"
}
```

### `POST /api/v1/jobs/:jobId/submit`

Submit a deliverable for a demo job.

Request:

```json
{
  "deliverable": "Completed deliverable for job #6",
  "chain": "baseSepolia"
}
```

Response notes:
- succeeds only when the job provider matches the server-managed demo provider
- rejects any `providerPrivateKey` field

### `POST /api/v1/jobs/:jobId/complete`

Complete a demo job.

Request:

```json
{
  "reason": "Approved",
  "chain": "baseSepolia"
}
```

Response notes:
- succeeds only when the job evaluator matches the server-managed demo evaluator
- rejects any `evaluatorPrivateKey` field

### `POST /api/v1/jobs/:jobId/reject`

Reject a demo job.

Request:

```json
{
  "reason": "Rejected",
  "chain": "celoSepolia"
}
```

### `POST /api/v1/jobs/:jobId/claim-refund`

Claim refund for a demo job.

Request:

```json
{
  "chain": "baseSepolia"
}
```

### `POST /api/v1/jobs/simulate`

Build transaction payloads without signing or sending them.

Supported actions:
- `createJob`
- `fundJob`
- `submitDeliverable`
- `completeJob`
- `rejectJob`
- `claimRefund`

Example:

```bash
curl -X POST https://kairen-dealrail-production.up.railway.app/api/v1/jobs/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "fundJob",
    "chain": "baseSepolia",
    "from": "0x77712e28F7A4a2EeD0bd7f9F8B8486332a38892e",
    "jobId": 2,
    "amountUsdc": "0.1"
  }'
```

## Discovery

### `GET /api/v1/discovery/providers`

Return provider candidates before negotiation.

Important:
- in mock mode, default discovery is the curated demo catalog
- provider `source` remains explicit

Example:

```bash
curl "https://kairen-dealrail-production.up.railway.app/api/v1/discovery/providers?query=automation%20benchmark%20report"
```

### `GET /api/v1/discovery/sources`

List enabled discovery sources.

### `GET /api/v1/discovery/opportunities`

List unmatched buyer demand saved in the opportunity book.

### `POST /api/v1/discovery/opportunities`

Persist unmatched buyer demand for later provider pickup.

## Negotiation

### `POST /api/v1/x402n/rfos`

Create a negotiation session.

Example:

```json
{
  "serviceRequirement": "automation benchmark report",
  "maxBudgetUsdc": 0.12,
  "maxDeliveryHours": 24,
  "minReputationScore": 700,
  "auctionMode": "reverse_auction"
}
```

### `GET /api/v1/x402n/rfos/:negotiationId`

Read the session state.

### `POST /api/v1/x402n/offers/:offerId/accept`

Mark an offer as accepted for batching.

### `POST /api/v1/x402n/rfos/:negotiationId/counter`

Run one reverse-auction round.

### `POST /api/v1/x402n/rfos/:negotiationId/batch`

Create a confirmation batch.

### `POST /api/v1/x402n/rfos/:negotiationId/confirm`

Confirm a selected offer and generate a savings receipt.

### `GET /api/v1/x402n/rfos/:negotiationId/receipt`

Return the generated receipt.

### `GET /api/v1/x402n/rfos/:negotiationId/activities`

Return the session activity feed.

## Machine Payments

### `GET /api/v1/payments/status`

Return machine-payments provider posture.

### `POST /api/v1/payments/proxy`

Proxy an HTTP request through the machine-payments adapter layer.

### `GET /api/v1/integrations/x402/status`

Compatibility status endpoint for the x402 adapter.

### `POST /api/v1/integrations/x402/proxy`

Compatibility proxy endpoint for x402-style requests.

## Delegations

### `POST /api/v1/integrations/metamask/delegation/build`

Build a delegation payload. This is a payload-construction surface, not a canonical delegated execution proof.

## Uniswap

### `GET /api/v1/integrations/uniswap/quote`

Build a quote for the current Base-oriented integration path.

### `POST /api/v1/integrations/uniswap/build-approve-tx`

Build an approval transaction payload.

### `POST /api/v1/integrations/uniswap/build-swap-tx`

Build a swap transaction payload.

### `GET /api/v1/integrations/uniswap/post-settlement/:jobId`

Build post-settlement approve and swap payloads from a completed job.

## Locus

### `POST /api/v1/integrations/locus/send-usdc`

Call the Locus payout bridge.

### `GET /api/v1/integrations/locus/tools`

List available Locus tools.

## Execution Provider Registry

### `GET /api/v1/execution/providers`

List available execution rails.

### `POST /api/v1/execution/submit`

Submit an execution request through the neutral execution provider layer.
