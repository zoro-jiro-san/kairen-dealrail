# DealRail Frontend

Modern web interface for DealRail - EIP-8183 compliant agentic commerce platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Web3**: Wagmi v2 + viem
- **Wallet**: RainbowKit
- **State**: React Query (TanStack Query)
- **API Client**: Axios + SWR

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Required variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com)

### 3. Contract Addresses (Already Configured)

The following contracts are deployed on Base Sepolia:

```typescript
Escrow: 0x53d368b5467524F7d674B70F00138a283e1533ce
USDC:   0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

These are already configured in `src/lib/contracts.ts`.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── providers.tsx       # Web3 providers
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── JobsList.tsx        # Job listing with filters
│   │   ├── JobCard.tsx         # Individual job card
│   │   └── CreateJobButton.tsx # Job creation modal
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and config
│   │   ├── wagmi.ts            # Wagmi configuration
│   │   ├── contracts.ts        # Contract ABIs and addresses
│   │   └── api.ts              # Backend API client
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

## Features

### ✅ Implemented

- **Wallet Connection**: RainbowKit integration with multiple wallet support
- **Job Listing**: View all jobs with filtering (All, Client, Provider)
- **Job Creation**: Create new jobs via smart contract
- **Job Cards**: Display job details with state badges
- **Real-time Updates**: React Query for data synchronization
- **Responsive Design**: Mobile-first TailwindCSS styling
- **Type Safety**: Full TypeScript coverage

### ✅ Newly Completed

- **Job Detail View**: Full job information page with state timeline
- **Backend Health Check**: Real-time backend connectivity monitoring
- **Enhanced Dashboard**: Polished stats display with icons
- **Simplified API Integration**: Works with blockchain-reading backend
- **Error Boundaries**: Graceful error handling throughout

### 🔄 Future Enhancements

- Fund job with USDC (via backend proxy)
- Submit work deliverables (via backend proxy)
- Approve/reject submissions (evaluator, via backend proxy)
- Claim refunds for expired jobs
- Artifact upload and viewing (IPFS)
- Settlement proof display
- Real-time blockchain event listening

## Components

### JobsList

Displays paginated list of jobs with filtering:
- **All Jobs**: All jobs in the system
- **My Jobs (Client)**: Jobs created by connected wallet
- **My Work (Provider)**: Jobs assigned to connected wallet

```tsx
<JobsList address={connectedAddress} />
```

### JobCard

Individual job card showing:
- Job ID and state
- Budget in ETH
- Party addresses (client, provider, evaluator)
- Expiry countdown
- Role badges for current user

### CreateJobButton

Modal form for creating new jobs:
- Provider address input
- Evaluator address input
- Expiry date picker
- Transaction confirmation

## Web3 Integration

### Wagmi v2 Configuration

Located in `src/lib/wagmi.ts`:
- Configured for Base Sepolia and Base Mainnet
- Injected wallet + WalletConnect connectors
- HTTP transport for RPC calls

### Contract Interaction

Using Wagmi hooks:

```tsx
import { useContractRead, useContractWrite } from 'wagmi';
import { ESCROW_ABI, getEscrowAddress } from '@/lib/contracts';

// Read job data
const { data: job } = useContractRead({
  address: getEscrowAddress(chainId),
  abi: ESCROW_ABI,
  functionName: 'getJob',
  args: [jobId],
});

// Write: Create job
const { writeContract } = useContractWrite();
writeContract({
  address: getEscrowAddress(chainId),
  abi: ESCROW_ABI,
  functionName: 'createJob',
  args: [provider, evaluator, expiry, hook],
});
```

## Backend API Integration

API client in `src/lib/api.ts`:

```typescript
import { jobsApi } from '@/lib/api';

// List jobs
const jobs = await jobsApi.list({ client: address });

// Get job by ID
const job = await jobsApi.getById(1);

// Get job by on-chain job ID
const job = await jobsApi.getByJobId(42);
```

## Styling

Using TailwindCSS with custom configuration:
- Dark theme by default
- Custom color palette (primary blue/cyan)
- Responsive breakpoints
- Gradient backgrounds
- Glass morphism effects

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Manual Build

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
