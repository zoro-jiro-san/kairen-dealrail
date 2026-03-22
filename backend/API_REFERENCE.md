# DealRail API Reference

Base URL:
- live: `https://kairen-dealrail-production.up.railway.app`
- local: `http://localhost:3001`

This file documents the public simplified backend that is live today.

## Important Safety Note

The public backend does not accept raw private keys for settlement routes.

Current public execution modes:
- `managed_demo_signer` for the hosted demo actors
- direct wallet signing from the frontend or external agent wallet path

## Health

`GET /health`

Returns:
- active chain summary
- supported chains without RPC URL leakage
- integration posture

## Chains

`GET /api/v1/chains`

Returns:
- default chain
- supported chain metadata

## Jobs

### List jobs

`GET /api/v1/jobs?chain=baseSepolia&limit=20`

### Get one job

`GET /api/v1/jobs/:jobId?chain=baseSepolia`

### Create job

`POST /api/v1/jobs`

Body:

```json
{
  "provider": "0x...",
  "evaluator": "0x...",
  "expiryDays": 7,
  "chain": "baseSepolia"
}
```

Note:
- this uses the managed demo client signer on the hosted backend

### Fund job

`POST /api/v1/jobs/:jobId/fund`

Body:

```json
{
  "amount": "0.1",
  "chain": "baseSepolia"
}
```

### Submit deliverable

`POST /api/v1/jobs/:jobId/submit`

Body:

```json
{
  "deliverable": "Completed benchmark report",
  "chain": "baseSepolia"
}
```

If a caller sends `providerPrivateKey`, the API rejects it.

### Complete job

`POST /api/v1/jobs/:jobId/complete`

Body:

```json
{
  "reason": "Approved",
  "chain": "baseSepolia"
}
```

If a caller sends `evaluatorPrivateKey`, the API rejects it.

### Reject job

`POST /api/v1/jobs/:jobId/reject`

Body:

```json
{
  "reason": "Rejected",
  "chain": "baseSepolia"
}
```

### Claim refund

`POST /api/v1/jobs/:jobId/claim-refund`

Body:

```json
{
  "chain": "baseSepolia"
}
```

## Discovery

### Providers

`GET /api/v1/discovery/providers`

Query params:
- `query`
- `minReputation`
- `maxBasePriceUsdc`
- `sources`

Response includes:
- `catalogMode`
- `providers`

When mock mode is enabled and no sources are specified, the endpoint defaults to the curated demo catalog.

## Negotiation

### Create session

`POST /api/v1/x402n/rfos`

Body:

```json
{
  "serviceRequirement": "automation benchmark report",
  "maxBudgetUsdc": 0.12,
  "maxDeliveryHours": 24,
  "minReputationScore": 700
}
```

In mock mode, the ranked offers come from the same curated discovery catalog exposed by `/discovery/providers`.

## Machine Payments

### Status

`GET /api/v1/payments/status`

### Proxy request

`POST /api/v1/payments/proxy`

Use this for x402-style endpoint calls after the provider endpoint is already known.

## MetaMask Delegation Builder

`POST /api/v1/integrations/metamask/delegation/build`

This builds a delegation payload.
It is not a delegated transaction proof.

## Uniswap Preview

### Quote preview

`GET /api/v1/integrations/uniswap/quote`

### Build approve preview

`POST /api/v1/integrations/uniswap/build-approve-tx`

### Build swap preview

`POST /api/v1/integrations/uniswap/build-swap-tx`

### Post-settlement routing preview

`GET /api/v1/integrations/uniswap/post-settlement/:jobId?chain=baseSepolia`

Important:
- preview-only
- Base-only
- not a sponsor-grade swap proof

## Locus

### List tools

`GET /api/v1/integrations/locus/tools`

### Send USDC

`POST /api/v1/integrations/locus/send-usdc`

This adapter exists, but it is not currently one of the repo’s strongest judged claims.
