# Vortis Quick Start Guide

## Current Status

✅ **Supabase Project Found**: Vortis (`bgywvwxqrijncqgdwsle`)
✅ **Connection Details Added**: `.env.local` updated with Supabase URL and API keys
⚠️ **Migrations Pending**: 6 migrations need manual application via Supabase Dashboard

---

## What's Been Done

1. ✅ Located Vortis Supabase project
2. ✅ Retrieved project URL and API keys
3. ✅ Updated `.env.local` with Supabase credentials
4. ✅ Linked Supabase CLI to project
5. ✅ Generated migration status report

---

## What You Need To Do

### Step 1: Apply Database Migrations

**Why**: The database schema needs to be set up before the application can work.

**How**: Open Supabase Dashboard and apply migrations manually:

1. Go to: https://supabase.com/dashboard/project/bgywvwxqrijncqgdwsle
2. Click **SQL Editor** in left sidebar
3. Apply migrations **in this order**:

```
1. supabase/migrations/002_create_watchlist.sql
2. supabase/migrations/20251009000001_enhance_core_schema.sql
3. supabase/migrations/20251009000002_create_api_usage_table.sql
4. supabase/migrations/20251009000003_create_user_preferences_table.sql
5. supabase/migrations/20251009000004_create_watchlist_alerts_table.sql
6. supabase/migrations/20251009000005_create_admin_views_functions.sql
```

**For each migration**:
- Open the file in your code editor
- Copy entire contents
- Paste into Supabase SQL Editor
- Click **Run**
- Verify "Success" message

**Estimated Time**: 15-20 minutes

---

### Step 2: Configure Stripe (Optional)

If you want to test payments:

1. Get Stripe API keys from https://dashboard.stripe.com/apikeys
2. Update `.env.local` with:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - Price IDs for plans

---

### Step 3: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Files Created/Updated

1. **`.env.local`** - Updated with Supabase credentials
2. **`MIGRATION_STATUS_REPORT.md`** - Detailed migration instructions
3. **`QUICK_START.md`** - This file
4. **`supabase/migrations/APPLY_ALL_MIGRATIONS.sql`** - Consolidated migration script

---

## Supabase Connection Info

**Project URL**: `https://bgywvwxqrijncqgdwsle.supabase.co`

**Anon Key** (already in .env.local):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneXd2d3hxcmlqbmNxZ2R3c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzAwOTcsImV4cCI6MjA3NDc0NjA5N30.rHVYlU-H83oR9l1ryju7pKq7JiyA_fBv_MDZFJR6_mk
```

---

## Verification Commands

After applying migrations, verify with:

```bash
# List tables
supabase db inspect db table-stats --linked

# List migrations
supabase migration list
```

Or run in Supabase SQL Editor:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public';
```

**Expected Results**:
- 8 tables created
- 13+ functions created
- 3 views created (2 regular + 1 materialized)

---

## Troubleshooting

### "Cannot connect to Supabase"
- Check `.env.local` has correct URL and anon key
- Restart dev server: `npm run dev`

### "Table does not exist"
- Migrations not applied yet
- Follow Step 1 above to apply migrations via Dashboard

### "Function does not exist"
- Specific migration not applied
- Check which migration contains that function
- Re-run that migration in SQL Editor

### CLI Connection Issues
- Use Supabase Dashboard SQL Editor instead
- Update CLI: `npm install -g supabase@latest`
- Ensure project is not paused in Dashboard

---

## Need More Details?

See **`MIGRATION_STATUS_REPORT.md`** for:
- Complete step-by-step migration instructions
- Verification queries
- Troubleshooting guide
- Schema documentation

---

## Summary

**✅ Ready to proceed!**

**Next action**: Apply migrations via Supabase Dashboard SQL Editor (Step 1 above)

**Time required**: 15-20 minutes

**Result**: Fully functional Vortis database with all tables, functions, and views

---

Generated: October 9, 2025
