# Supabase Setup - Action Required

**Status:** ⏳ Pending Manual Setup
**Required For:** Database persistence, advanced queries, event history

---

## What You Need to Do

### 1. Create Supabase Project (5 minutes)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `dealrail` (or your choice)
   - **Database Password:** Generate strong password (SAVE THIS!)
   - **Region:** Choose closest to you
   - **Plan:** Free tier
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### 2. Get Connection String

1. In Supabase dashboard: **Settings** → **Database**
2. Find **Connection String** section
3. Select **URI** tab
4. Copy the string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

### 3. Update .env File

Add to `backend/.env`:

```bash
# Supabase Database
DATABASE_URL="postgresql://postgres:your-actual-password@db.xxxxx.supabase.co:5432/postgres"
```

### 4. Run Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

Expected output:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

### 5. Verify in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. You should see 5 tables:
   - Job
   - Artifact
   - SettlementProof
   - IdentityCache
   - ProcessedEvent

### 6. Switch to Full API

Once database is ready:

```bash
# Stop simplified server (Ctrl+C)
# Start full server with database
npm run dev
```

---

## Current Workaround

We're running the **simplified API** that works without a database:

```bash
npm run dev:simple
```

**What it does:**
- ✅ Reads jobs directly from blockchain
- ✅ All CRUD operations work
- ✅ Perfect for frontend development
- ❌ No persistent storage
- ❌ No event history
- ❌ No advanced queries

**What database adds:**
- ✅ Fast queries (cached data)
- ✅ Event history tracking
- ✅ Negotiation artifacts storage
- ✅ Settlement proofs
- ✅ Identity verification cache

---

## Benefits of Supabase

1. **Free Tier:**
   - 500 MB database storage
   - 1 GB file storage
   - 2 GB bandwidth
   - More than enough for MVP

2. **PostgreSQL:**
   - Full SQL support
   - JSON columns
   - Enums
   - Complex queries

3. **Auto Backups:**
   - Daily backups included
   - Point-in-time recovery

4. **Realtime (Future):**
   - Can replace WebSocket implementation
   - Live updates to frontend

---

## For Now

**Frontend development can proceed** with the simplified API!

The blockchain is the source of truth, so the API works perfectly without a database. You only need Supabase for:
- Faster queries (caching)
- Event history
- Advanced features

---

## Detailed Guide

See: `docs/guides/SUPABASE_SETUP.md`

---

**Action Required:** Manual Supabase setup (5 minutes)
**Blocking:** No - frontend can use simplified API
**Priority:** Medium - Nice to have, not critical for MVP
