# DealRail Frontend

This package contains the operator and judge-facing UI for DealRail.

Live deployment:
- `https://dealrail.kairen.xyz/`

## Current Stack

- Next.js 16
- React 18
- wagmi + viem
- RainbowKit
- Tailwind CSS

## Canonical Contracts

Configured in [`src/lib/contracts.ts`](src/lib/contracts.ts):

### Base Sepolia
- EscrowRailERC20: `0xE25B10057556e9714d2ac60992b68f4E61481cF9`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- DealRailHook: `0x5fA109A74a688a49D254a21C2F3ab238E2A7F62e`

### Celo Sepolia
- EscrowRailERC20: `0xB9dfa53326016415ca6fb9eb16A0f050c8d15C74`
- Stable token: `0x01C5C0122039549AD1493B8220cABEdD739BC44E`
- DealRailHook: `0x04B0D16f790A5F83dc48c7e4D05467ff2eA57519`

## Main Routes

- `/`: landing and system overview
- `/terminal`: operator-centric terminal view
- `/jobs/[jobId]`: job details
- `/docs`: in-app docs surface

## Commands

```bash
npm install
npm run dev
npm run build
npm run type-check
```

The dev server runs on `http://localhost:3000`.

## Cloudflare Workers

This frontend should be deployed from the [`frontend`](.) directory, not the monorepo root.

Use the supported OpenNext adapter path, not `@cloudflare/next-on-pages`.

```bash
npm install
npm run build:worker
npm run deploy:worker
```

Important Cloudflare setting for Git-based deploys:
- Root Directory: `frontend`
- Build command: `npm install && npm run build:worker`
- Deploy command: `npm run deploy:worker`

If Cloudflare runs the build from the repo root, it will fail to detect Next.js because the real app package is in `frontend/package.json`, not the root `package.json`.

## Important Files

- [`src/app/page.tsx`](src/app/page.tsx)
- [`src/components/AppShell.tsx`](src/components/AppShell.tsx)
- [`src/components/HeroFlowArchitecture.tsx`](src/components/HeroFlowArchitecture.tsx)
- [`src/components/DealPipelineDashboard.tsx`](src/components/DealPipelineDashboard.tsx)
- [`src/lib/api.ts`](src/lib/api.ts)
- [`src/lib/contracts.ts`](src/lib/contracts.ts)

## Integration Status From The UI Perspective

Strongly grounded:
- browser desk and browser terminal
- chain-aware contract reads
- frontend-only service and receipt simulation
- operator-oriented architecture and job navigation

Implemented but still partial:
- delegation builders
- Uniswap payload flows
- Locus calls
- x402 and x402n workbench flows

For the canonical submission story, use:
- [`../docs/submission/00_START_HERE.md`](../docs/submission/00_START_HERE.md)
- [`../docs/submission/05_WINNING_STRATEGY.md`](../docs/submission/05_WINNING_STRATEGY.md)

```bash
npm run build
npm run start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://kairen-dealrail-production.up.railway.app` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | `abc123...` |

## Troubleshooting

### Wallet Not Connecting

- Ensure you're on a supported network
- Check WalletConnect project ID is set
- Try clearing browser cache

### Contract Calls Failing

- Verify contract address in `src/lib/contracts.ts`
- Check you have test ETH for gas
- Ensure wallet is connected to Base Sepolia or Celo Sepolia

### API Errors

- Verify backend is running on `NEXT_PUBLIC_API_URL`
- Check CORS is enabled in backend
- Inspect network tab for error details

## Product Posture

The frontend is intentionally split across two modes:

- demo-first mode with no wallet required
- real operator mode where wallet connection is available for onchain actions

For the canonical product and judging story, use:
- `README.md`
- `AGENT.md`
- `../docs/submission/00_START_HERE.md`

## License

MIT
