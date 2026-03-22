# DealRail Frontend

This package contains the operator and judge-facing UI for DealRail.

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
- `/dashboard`: deal pipeline dashboard
- `/flow`: lifecycle overview
- `/integrations`: sponsor-related integration workbench
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
cd frontend
npm install
npm run build:worker
npm run deploy:worker
```

Important Cloudflare setting for Git-based deploys:
- Root Directory: `frontend`
- Build command: `npm run build:worker` if you are using a custom build command

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
- escrow lifecycle views
- chain-aware contract reads
- operator-oriented architecture and job navigation

Exposed but not sponsor-proof-complete:
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
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.dealrail.xyz` |
| `NEXT_PUBLIC_CHAIN_ID` | Blockchain chain ID | `84532` (Base Sepolia) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | `abc123...` |

## Troubleshooting

### Wallet Not Connecting

- Ensure you're on the correct network (Base Sepolia)
- Check WalletConnect project ID is set
- Try clearing browser cache

### Contract Calls Failing

- Verify contract address in `src/lib/contracts.ts`
- Check you have test ETH for gas
- Ensure wallet is connected to Base Sepolia

### API Errors

- Verify backend is running on `NEXT_PUBLIC_API_URL`
- Check CORS is enabled in backend
- Inspect network tab for error details

## Next Steps

1. ✅ Basic UI and wallet connection
2. ✅ Job listing and creation
3. 🔄 Job detail view with actions
4. 🔄 Fund/submit/approve/reject flows
5. 🔄 Artifact upload and viewing
6. 🔄 Settlement proof display
7. 🔄 Real-time updates via WebSocket
8. 🔄 Notifications and toasts
9. 🔄 Analytics dashboard

## License

MIT
