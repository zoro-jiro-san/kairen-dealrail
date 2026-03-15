# Supabase Database Setup Guide

This guide will help you set up a Supabase PostgreSQL database for DealRail.

---

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `dealrail` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

---

## Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection String** section
3. Select **URI** tab
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you set in Step 1

---

## Step 3: Configure Backend

1. Create `.env` file in the `backend/` directory:
   ```bash
   cp .env.example .env
   ```

2. Update the `DATABASE_URL` in `.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:your-actual-password@db.xxxxx.supabase.co:5432/postgres"
   ```

---

## Step 4: Deploy Database Schema

Run Prisma migrations to create all tables:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

Expected output:
```
✔ Generated Prisma Client
🚀  Your database is now in sync with your Prisma schema.
```

---

## Step 5: Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see 5 tables created:
   - `Job`
   - `Artifact`
   - `SettlementProof`
   - `IdentityCache`
   - `ProcessedEvent`

3. Check table structure by clicking on each table

---

## Step 6: Test Connection

Start the backend server:

```bash
npm run dev
```

You should see:
```
✅ Database connected
🎧 Starting event listener from block: latest
✅ Event listener started
✅ DealRail API server running on port 3000
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-14T...",
  "blockchain": {
    "chainId": 84532,
    "escrowAddress": "0x..."
  }
}
```

---

## Prisma Studio (Optional)

View and edit database records with Prisma Studio:

```bash
npm run db:studio
```

This opens a browser interface at `http://localhost:5555`

---

## Database Schema Overview

### Job Table
- Stores on-chain jobs synced from blockchain events
- Tracks state transitions (OPEN → FUNDED → SUBMITTED → COMPLETED)
- Includes timestamps for all lifecycle events

### Artifact Table
- Negotiation artifacts and evidence
- References job via foreign key
- Supports IPFS storage or blob storage

### SettlementProof Table
- Settlement proofs generated on job completion
- One-to-one relationship with Job
- Includes IPFS CID and EIP-712 signature

### IdentityCache Table
- Caches identity verification results
- Reduces blockchain queries for verified addresses
- Supports multiple verification providers

### ProcessedEvent Table
- Tracks all processed blockchain events
- Prevents duplicate processing during reorgs
- Unique constraint on (txHash, logIndex)

---

## Supabase Features to Explore

### Row Level Security (RLS)
You can enable RLS for additional security:

1. Go to **Authentication** → **Policies**
2. Enable RLS on tables
3. Create policies for read/write access

**Note:** Not required for MVP since backend handles authorization.

### Database Backups
Supabase automatically backs up your database daily (free tier).

### Realtime Subscriptions (Future)
Supabase supports PostgreSQL realtime subscriptions:
- Can replace WebSocket implementation
- Client can subscribe to table changes
- Useful for live job status updates

---

## Connection Pooling

For production, use connection pooling:

1. In Supabase dashboard, go to **Settings** → **Database**
2. Find **Connection Pooling** section
3. Copy the **Transaction** mode connection string
4. Use this for Prisma in production:
   ```
   DATABASE_URL="postgres://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

**Benefits:**
- Handles more concurrent connections
- Better performance under load
- Recommended for serverless deployments

---

## Troubleshooting

### Connection Refused
- Check if your IP is allowed (Supabase allows all IPs by default)
- Verify password is correct
- Ensure connection string format is correct

### Migration Errors
- Check if tables already exist (drop them in Table Editor)
- Ensure Prisma schema is valid: `npx prisma validate`
- Check Supabase logs in dashboard

### Performance Issues
- Add indexes via Prisma schema (already included)
- Use connection pooling for production
- Monitor query performance in Supabase dashboard

---

## Cost Estimation

**Free Tier Limits:**
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

**Estimated Usage (MVP):**
- ~10 MB database (1000 jobs)
- ~100 MB artifacts/proofs
- Well within free tier limits

---

## Production Checklist

- [ ] Enable SSL mode: Add `?sslmode=require` to DATABASE_URL
- [ ] Use connection pooling string
- [ ] Enable database backups (automatic on Supabase)
- [ ] Set up monitoring and alerts
- [ ] Consider Row Level Security if exposing direct access
- [ ] Review and optimize indexes
- [ ] Set up staging database for testing

---

## Next Steps

1. ✅ Database created and schema deployed
2. 🔄 Deploy smart contracts to Base Sepolia
3. 🔄 Update ESCROW_ADDRESS in .env
4. 🔄 Test full integration (contract events → database)
5. 🔄 Build frontend and connect to API

---

**Setup Status: Ready for Development** 🚀

Your Supabase database is now configured and ready to receive blockchain events from the DealRail smart contracts!
