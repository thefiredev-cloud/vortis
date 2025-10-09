# Vortis - Clerk Authentication Migration

**Status:** ✅ Code Migration Complete
**Date:** 2025-10-09
**Migration Type:** Supabase Auth → Clerk

---

## Quick Start

Your Vortis authentication has been migrated from Supabase Auth to Clerk. Follow these steps to complete the setup:

### 1. Create Clerk Account (5 min)
```
https://clerk.com/sign-up
```

### 2. Add Environment Variables (2 min)
```bash
# Add to .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### 3. Apply Database Migrations (5 min)
```bash
# Run in Supabase SQL Editor or via CLI
npx supabase db push
```

### 4. Test (5 min)
```bash
npm run dev
# Visit http://localhost:3000/auth/signup
```

**Total Time to Live:** ~15-20 minutes

---

## What Changed

### Before (Supabase Auth)
- Google OAuth via Supabase
- Email/password authentication
- User profiles auto-created via database triggers
- Session management via Supabase cookies

### After (Clerk)
- Google OAuth via Clerk (better UI, more features)
- Clerk handles all authentication
- User profiles synced via webhooks
- Session management via Clerk cookies
- Supabase used for database only

### Benefits
- ✅ Better authentication UI/UX
- ✅ More OAuth providers available (GitHub, Microsoft, Apple, etc.)
- ✅ Built-in MFA support
- ✅ Better session management
- ✅ User management dashboard
- ✅ Automatic security updates
- ✅ Better mobile experience

---

## File Structure

### Modified Files
```
/app/layout.tsx                          # Added ClerkProvider
/middleware.ts                           # Using clerkMiddleware
/app/dashboard/layout.tsx                # Using auth()
/components/dashboard/dashboard-nav.tsx  # Using UserButton
/app/auth/login/page.tsx                 # Using SignIn
/app/auth/signup/page.tsx                # Using SignUp
/.env.local                              # Added Clerk vars
```

### New Files
```
/app/api/webhooks/clerk/route.ts         # Clerk → Supabase sync
/supabase/migrations/
  └─ 20250109_clerk_migration.sql        # Schema changes
  └─ 20250109_clerk_database_functions.sql  # DB functions
/docs/
  ├─ CLERK_SETUP.md                      # Setup guide
  ├─ CLERK_MIGRATION_COMPLETE.md         # Migration details
  ├─ TESTING_CHECKLIST.md                # 25 tests
  └─ ENVIRONMENT_VARIABLES.md            # Env var reference
/MIGRATION_SUMMARY.md                    # Quick reference
/README_CLERK_MIGRATION.md               # This file
```

### Files to Remove (Optional)
```
/components/auth/google-sign-in-button.tsx  # Not needed
/components/auth/auth-layout.tsx            # Not needed
/app/auth/callback/route.ts                 # Not needed
/components/auth/auth-error.tsx             # Not needed
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      User Journey                         │
└──────────────────────────────────────────────────────────┘

1. User visits /auth/login or /auth/signup
   ↓
2. Clicks "Continue with Google"
   ↓
3. Clerk handles Google OAuth
   ↓
4. User authenticated by Clerk
   ↓
5. Clerk sends webhook to /api/webhooks/clerk
   ↓
6. Webhook creates/updates profile in Supabase
   ↓
7. User redirected to /dashboard
   ↓
8. Dashboard loads data from Supabase

┌──────────────────────────────────────────────────────────┐
│                     Data Flow                             │
└──────────────────────────────────────────────────────────┘

Clerk (Authentication)
  │
  ├─ user.created ──┐
  ├─ user.updated ──┼──> Webhook ──> Supabase (Database)
  └─ user.deleted ──┘                  │
                                       ├─ profiles
                                       ├─ subscriptions
                                       ├─ watchlists
                                       └─ analysis_history
```

---

## Database Schema

### Profiles Table (Modified)

**Before:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,  -- Supabase user ID
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**After:**
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,  -- Clerk user ID (e.g., "user_2abc123xyz")
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Key Changes:**
- `id` column: UUID → TEXT (for Clerk user IDs)
- Foreign keys updated in related tables
- RLS policies updated for service role
- Auth triggers removed

---

## Environment Variables

### Required Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # From Clerk Dashboard
CLERK_SECRET_KEY=sk_test_xxxxx                   # From Clerk Dashboard
CLERK_WEBHOOK_SECRET=whsec_xxxxx                 # From Clerk Webhooks

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to Get:**
- **Clerk Keys:** https://dashboard.clerk.com → Configure → API Keys
- **Webhook Secret:** https://dashboard.clerk.com → Webhooks → [Your Endpoint]
- **Supabase Keys:** https://supabase.com/dashboard → Project → API

---

## Setup Instructions

### Development Setup

#### 1. Install Dependencies
```bash
cd /Users/tannerosterkamp/vortis
npm install
```

#### 2. Configure Clerk

**Create Clerk Application:**
1. Go to https://clerk.com
2. Sign up / Log in
3. Create new application: "Vortis"
4. Select "Next.js" as framework

**Enable Google OAuth:**
1. Navigate to: Configure → Social Connections
2. Enable "Google"
3. Save

**Get API Keys:**
1. Navigate to: Configure → API Keys
2. Copy "Publishable key" and "Secret key"
3. Add to `.env.local`

#### 3. Set Up Webhook (Local Development)

**Install ngrok:**
```bash
npm install -g ngrok
```

**Start ngrok:**
```bash
# In terminal 1
npm run dev

# In terminal 2
ngrok http 3000
```

**Configure webhook in Clerk:**
1. Copy ngrok URL (e.g., `https://abc123.ngrok.io`)
2. Go to Clerk Dashboard → Webhooks
3. Click "Add Endpoint"
4. URL: `https://abc123.ngrok.io/api/webhooks/clerk`
5. Subscribe to: `user.created`, `user.updated`, `user.deleted`
6. Copy "Signing Secret"
7. Add to `.env.local` as `CLERK_WEBHOOK_SECRET`

#### 4. Apply Database Migrations

**Option A: Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select Vortis project
3. Navigate to: SQL Editor
4. Run `/supabase/migrations/20250109_clerk_migration.sql`
5. Run `/supabase/migrations/20250109_clerk_database_functions.sql`

**Option B: Supabase CLI**
```bash
npx supabase db push
```

#### 5. Get Supabase Service Role Key

1. Supabase Dashboard → Project → API
2. Copy "service_role" key (NOT anon!)
3. Add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Security Warning:**
- Never expose service role key in client code
- Only use in API routes and webhooks
- This key bypasses ALL RLS policies

#### 6. Test Authentication

```bash
# Start app
npm run dev

# Visit in browser
http://localhost:3000/auth/signup
```

**Test Flow:**
1. Click "Continue with Google"
2. Complete Google OAuth
3. Should redirect to `/dashboard`
4. Check Supabase for new profile:
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
   ```

---

## Production Deployment

### Pre-Deployment Checklist

#### Clerk Configuration
- [ ] Create production Clerk instance
- [ ] Enable Google OAuth with custom credentials
- [ ] Configure production webhook URL
- [ ] Switch to live mode keys (`pk_live_`, `sk_live_`)
- [ ] Set up custom domain (optional)

#### Environment Variables
- [ ] Update to production Clerk keys
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Add production webhook secret
- [ ] Verify all secrets are set in hosting platform
- [ ] Never commit `.env.local` to git

#### Database
- [ ] Apply migrations to production Supabase
- [ ] Verify RLS policies
- [ ] Test webhook endpoint
- [ ] Set up database backups
- [ ] Configure monitoring

#### Testing
- [ ] Run full test suite (see `/docs/TESTING_CHECKLIST.md`)
- [ ] Test complete auth flow in production
- [ ] Verify webhook events are received
- [ ] Test user creation, update, deletion
- [ ] Check error tracking and logging

### Deployment Steps

1. **Deploy Code**
   ```bash
   git add .
   git commit -m "feat(auth): Migrate from Supabase Auth to Clerk"
   git push origin main
   ```

2. **Set Environment Variables**
   - In your hosting platform (Vercel, Netlify, etc.)
   - Add all production environment variables
   - Use live mode Clerk keys

3. **Configure Production Webhook**
   - Clerk Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to events
   - Copy signing secret to hosting platform env vars

4. **Apply Database Migrations**
   - Run migrations in production Supabase
   - Verify functions are created

5. **Test Production**
   - Visit `https://your-domain.com/auth/signup`
   - Create test account
   - Verify profile in Supabase
   - Check webhook logs in Clerk

---

## Testing

### Quick Test (5 min)

```bash
# Start app
npm run dev

# Test these flows:
1. Sign up with Google       → Should create profile in Supabase
2. Sign out                   → Should redirect to home
3. Sign in with Google        → Should work with existing account
4. Access /dashboard          → Should require authentication
5. Access /                   → Should be public
```

### Comprehensive Testing

See `/docs/TESTING_CHECKLIST.md` for 25 comprehensive tests covering:
- Authentication flows
- Protected routes
- Webhook events
- UI/UX
- Performance
- Security
- Cross-browser compatibility

---

## Troubleshooting

### Common Issues

#### "Missing CLERK_WEBHOOK_SECRET"
**Problem:** Webhook endpoint returns error
**Solution:** Add webhook secret to `.env.local` from Clerk Dashboard

#### "Profile not created in Supabase"
**Problem:** User authenticates but profile missing
**Solution:**
1. Check webhook logs in Clerk Dashboard
2. Verify webhook URL is correct
3. Check database migrations are applied
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is set

#### "Cannot connect to Supabase"
**Problem:** Database connection fails
**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` is set
3. Verify Supabase project is not paused

#### "Authentication redirect loop"
**Problem:** Keeps redirecting between login and dashboard
**Solution:**
1. Clear browser cookies
2. Check middleware configuration
3. Verify Clerk keys are correct
4. Restart development server

#### Webhook returns 500 error
**Problem:** Webhook fails to process
**Solution:**
1. Check Supabase logs
2. Verify database functions exist
3. Check service role key permissions
4. Review webhook handler logs

### Debug Mode

Enable verbose logging:

```typescript
// In /app/api/webhooks/clerk/route.ts
console.log('Webhook event:', JSON.stringify(evt, null, 2));
console.log('Database operation result:', result);

// In middleware.ts
console.log('Auth check for:', request.url);
console.log('User authenticated:', !!userId);
```

---

## Documentation

### Primary Documents

1. **MIGRATION_SUMMARY.md** - Quick reference (this is your go-to)
2. **CLERK_SETUP.md** - Detailed setup guide
3. **CLERK_MIGRATION_COMPLETE.md** - Technical migration details
4. **TESTING_CHECKLIST.md** - Comprehensive test plan
5. **ENVIRONMENT_VARIABLES.md** - All env vars explained

### External Resources

- **Clerk Docs:** https://clerk.com/docs
- **Clerk Discord:** https://clerk.com/discord
- **Next.js + Clerk:** https://clerk.com/docs/quickstarts/nextjs
- **Supabase Docs:** https://supabase.com/docs
- **Webhook Debugging:** https://dashboard.clerk.com/webhooks

---

## Support

### Getting Help

1. Check documentation above
2. Review Clerk Dashboard logs
3. Check Supabase logs
4. Search Clerk docs
5. Join Clerk Discord
6. Contact your team lead

### Reporting Issues

When reporting issues, include:
- Error message (full stack trace)
- Steps to reproduce
- Environment (dev/staging/prod)
- Clerk Dashboard webhook logs
- Supabase logs if relevant
- Browser console errors

---

## Rollback Plan

If you need to revert to Supabase Auth:

### Immediate Rollback

```bash
# Revert code changes
git revert HEAD~[number-of-commits]

# Reinstall old dependencies
npm install

# Revert database (careful!)
# Use backup or previous migration
```

### Planned Rollback

See `/docs/CLERK_MIGRATION_COMPLETE.md` for detailed rollback instructions.

---

## Migration Statistics

- **Files Modified:** 7
- **Files Created:** 11
- **Files to Remove:** 4 (optional)
- **Dependencies Added:** 2
- **Environment Variables Added:** 3
- **Database Tables Modified:** 2
- **Time to Complete Setup:** ~15-20 minutes
- **Migration Complexity:** Medium

---

## Next Steps

1. [ ] Complete Clerk account setup
2. [ ] Add environment variables
3. [ ] Apply database migrations
4. [ ] Test authentication flow
5. [ ] Configure production webhook
6. [ ] Run full test suite
7. [ ] Deploy to production
8. [ ] Monitor webhook success rate
9. [ ] Clean up old auth files (optional)
10. [ ] Update team documentation

---

## Questions?

For questions about this migration:

1. Review the comprehensive guides in `/docs/`
2. Check Clerk documentation
3. Review Supabase logs
4. Contact your development team

---

**Migration completed by:** Claude AI Assistant
**Date:** 2025-10-09
**Project:** Vortis - AI-Powered Trading Intelligence
**Status:** ✅ Ready for setup and testing
