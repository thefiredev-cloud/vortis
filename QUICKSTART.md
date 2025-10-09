# Clerk Migration - Quick Start Guide

**Status:** ✅ Code Migration Complete
**Time Required:** 15-20 minutes

## What Was Done

Your Vortis authentication has been migrated from Supabase Auth to Clerk. All code changes are complete. You just need to configure your accounts.

## What You Need to Do

### 1. Create Clerk Account (5 min)
1. Go to https://clerk.com and sign up
2. Create application named "Vortis"
3. Enable Google OAuth
4. Copy API keys

### 2. Add Environment Variables (2 min)
Add to `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### 3. Run Database Migrations (5 min)
In Supabase SQL Editor, run these files:
- `/supabase/migrations/20250109_clerk_migration.sql`
- `/supabase/migrations/20250109_clerk_database_functions.sql`

### 4. Configure Webhook (5 min)
1. Install ngrok: `npm install -g ngrok`
2. Start ngrok: `ngrok http 3000`
3. Add webhook in Clerk Dashboard: `https://[ngrok-url].ngrok.io/api/webhooks/clerk`
4. Subscribe to: user.created, user.updated, user.deleted
5. Copy webhook secret to `.env.local`

### 5. Test (3 min)
```bash
npm run dev
# Visit: http://localhost:3000/auth/signup
# Sign up with Google
# Should redirect to dashboard
```

## Documentation

- **Quick Reference:** `/MIGRATION_SUMMARY.md`
- **Complete Guide:** `/README_CLERK_MIGRATION.md`
- **Setup Details:** `/docs/CLERK_SETUP.md`
- **Testing:** `/docs/TESTING_CHECKLIST.md`

## Need Help?

All detailed instructions are in the files above. Start with `MIGRATION_SUMMARY.md`.
