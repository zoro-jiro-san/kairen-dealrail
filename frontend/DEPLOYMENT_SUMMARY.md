# Frontend Deployment Summary

Last updated: 2026-03-22

## Current Status

- frontend deployed on Cloudflare Workers
- live custom domain: `https://dealrail.kairen.xyz/`
- framework: Next.js via OpenNext
- worker name: `kairen-dealrail`

## What This Frontend Is

The frontend is the human operator surface for DealRail.

Its job is to:
- explain the product quickly
- provide a polished browser terminal
- allow frontend-only demo flows without wallet friction
- expose docs, workflow, and chain-aware job views

It is not trying to be the full backend in the browser.

## Current Deployment Model

DealRail uses the supported Cloudflare Workers path for Next.js:

```text
frontend/
  -> npm run build:worker
  -> OpenNext output
  -> Wrangler deploy
  -> Cloudflare Worker
  -> dealrail.kairen.xyz
```

Important files:
- `frontend/package.json`
- `frontend/wrangler.toml`
- `frontend/open-next.config.ts`

## Required Cloudflare Settings

For Git-connected Cloudflare builds:
- Root directory: `frontend`
- Build command: `npm install && npm run build:worker`
- Deploy command: `npm run deploy:worker`

Do not use:
- `@cloudflare/next-on-pages`
- repo-root build commands that assume `frontend/` is still one level below the working directory
- Pages-style static output expectations such as `.vercel/output/static`

## Local Commands

### Development
```bash
cd frontend
npm install
npm run dev
```

### Production-style build
```bash
cd frontend
npm run build
```

### Cloudflare Worker build
```bash
cd frontend
npm run build:worker
```

### Cloudflare deploy
```bash
cd frontend
npm run deploy:worker
```

## Environment Variables

Core frontend env vars:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL, currently `https://kairen-dealrail-production.up.railway.app` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect integration |

Wallet connection is optional for the demo path.

## Current Product Surfaces In The Frontend

- `/`: landing and product overview
- `/terminal`: browser terminal and demo walkthrough
- `/docs`: in-app architecture and workflow docs
- `/jobs/[jobId]`: chain-aware job detail page

## Supported Settlement Chains In The UI

- Base Sepolia
- Celo Sepolia

The frontend can:
- read chain-aware job data
- simulate stablecoin settlement flows
- present browser-only demo receipts

## Common Failure Modes

### Build fails with "No Next.js version detected"
Cloudflare is building from the wrong directory.

Fix:
- set Root directory to `frontend`

### Build fails with "Missing script: build:worker"
Cloudflare is using the wrong working directory or an old commit.

Fix:
- confirm the latest `frontend/package.json` is pushed
- keep Root directory set to `frontend`
- run `npm install && npm run build:worker`

### Build looks successful but domain serves "Hello world"
The custom domain is attached to the wrong Worker.

Fix:
- bind the domain to the Worker named in `frontend/wrangler.toml`
- redeploy the actual app Worker

## Canonical UX Posture

This frontend should stay:
- simple
- product-like
- Kairen-branded
- agent-friendly without being visually noisy

When updating it, prefer the current product story:
- browser desk for humans
- npm CLI for agents
- same backend and escrow rails underneath
