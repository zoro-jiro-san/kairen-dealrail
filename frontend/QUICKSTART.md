# DealRail Frontend - Quick Start Guide

Get the DealRail frontend running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Backend running on http://localhost:3001
- Wallet with Base Sepolia testnet access

## Step 1: Install Dependencies

```bash
cd /Users/sarthiborkar/Build/kairen-protocol/kairen-dealrail/frontend
npm install
```

## Step 2: Environment Setup (Optional)

The frontend will work with defaults, but for full functionality:

```bash
# Create environment file
cp .env.example .env.local

# Edit .env.local and add:
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get WalletConnect Project ID: https://cloud.walletconnect.com

## Step 3: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 4: Connect Wallet

1. Click "Connect Wallet" button in header
2. Select your wallet (MetaMask, Coinbase, etc.)
3. Switch to **Base Sepolia** network (Chain ID: 84532)

## Step 5: View Jobs

You should see:
- Job #1 (Completed)
- Job #2 (Completed)
- Job #3 (Open)
- Job #4 (Completed)
- Job #5 (Completed)

## Available Features

### View All Jobs
- Click filter tabs: All Jobs / My Jobs / My Work
- Click job card to view details

### Create New Job
- Click "+ Create New Job"
- Enter provider address
- Enter evaluator address
- Set expiry date
- Approve transaction

### Job Details
- Click "View Details" on any job card
- See complete job information
- View on BaseScan
- Check next steps for your role

## Troubleshooting

### Backend Disconnected (Red Banner)
```bash
# Start backend in another terminal
cd ../backend
npm run dev
```

### Wallet Not Connecting
1. Switch to Base Sepolia in your wallet
2. Refresh the page
3. Try different wallet

### Jobs Not Loading
1. Check backend is running (green banner should show)
2. Click "Refresh" button
3. Check browser console for errors

## Configuration

### Backend URL
Default: `http://localhost:3001`

Change in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://your-backend-url
```

### Contracts (Already Configured)
- Escrow: `0x53d368b5467524F7d674B70F00138a283e1533ce`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Network: Base Sepolia (84532)

## Scripts

```bash
npm run dev        # Development server (port 3000)
npm run build      # Production build
npm start          # Production server
npm run type-check # TypeScript checking
npm run lint       # ESLint
```

## What's Next?

After you have the frontend running:

1. **Create a job** - Test job creation flow
2. **Check details** - Click through to job detail pages
3. **Filter jobs** - Try "My Jobs" and "My Work" filters
4. **Test responsiveness** - Resize browser window

## File Locations

```
frontend/
├── src/app/page.tsx              → Home page
├── src/app/jobs/[jobId]/page.tsx → Job detail page
├── src/components/JobsList.tsx   → Jobs list component
├── src/lib/api.ts                → Backend API client
└── src/lib/contracts.ts          → Smart contract config
```

## Support

Questions? Check:
1. README.md - Full documentation
2. DEPLOYMENT_SUMMARY.md - Complete feature list
3. Browser console - Error messages

## Success Checklist

- [ ] `npm install` completed
- [ ] `npm run dev` starts server
- [ ] http://localhost:3000 loads
- [ ] Backend health shows green
- [ ] Wallet connects successfully
- [ ] Jobs list displays 5 jobs
- [ ] Can view job details
- [ ] Create job modal opens

All checked? You're ready to go! 🚀
