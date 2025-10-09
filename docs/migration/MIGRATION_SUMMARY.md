# Clerk Migration Summary - Quick Reference

Migration from Supabase Auth to Clerk completed. Use this as a quick reference.

## Installation Status

- [x] Clerk packages installed (`@clerk/nextjs`, `svix`)
- [x] Code migration complete
- [x] Database migrations created
- [x] Documentation written
- [ ] Environment variables configured (YOU MUST DO THIS)
- [ ] Clerk account setup (YOU MUST DO THIS)
- [ ] Database migrations applied (YOU MUST DO THIS)
- [ ] Testing completed (YOU MUST DO THIS)

## Next Steps (REQUIRED)

### 1. Set Up Clerk Account (15 minutes)

1. Go to https://clerk.com and sign up
2. Create new application named "Vortis"
3. Enable Google OAuth provider
4. Copy API keys

### 2. Configure Environment Variables (5 minutes)

Add to `/Users/tannerosterkamp/vortis/.env.local`:

```bash
# Clerk (from Clerk Dashboard > API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx  # From Webhooks section

# Supabase (from Supabase Dashboard > API)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

**Note:** Supabase URL and anon key are already set.

### 3. Apply Database Migrations (10 minutes)

Run both migrations in Supabase SQL Editor:

```sql
-- File 1: /Users/tannerosterkamp/vortis/supabase/migrations/20250109_clerk_migration.sql
-- Modifies profiles table for Clerk user IDs

-- File 2: /Users/tannerosterkamp/vortis/supabase/migrations/20250109_clerk_database_functions.sql
-- Creates upsert/delete functions for webhooks
```

Or use Supabase CLI:
```bash
npx supabase db push
```

### 4. Configure Webhook in Clerk (5 minutes)

For local development:
```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm run dev

# In another terminal
ngrok http 3000

# Use ngrok URL in Clerk webhook: https://xxxxx.ngrok.io/api/webhooks/clerk
```

In Clerk Dashboard:
1. Go to: Configure > Webhooks
2. Add endpoint: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret to `.env.local`

### 5. Test Authentication (15 minutes)

```bash
# Start the app
npm run dev

# Open browser
http://localhost:3000/auth/signup
```

Test flow:
1. Sign up with Google
2. Check you're redirected to dashboard
3. Verify profile created in Supabase:
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
   ```
4. Test sign out and sign in

## File Changes Summary

### Modified Files (7)
- `/app/layout.tsx` - Added ClerkProvider
- `/middleware.ts` - Using clerkMiddleware
- `/app/dashboard/layout.tsx` - Using Clerk auth()
- `/components/dashboard/dashboard-nav.tsx` - Using UserButton
- `/app/auth/login/page.tsx` - Using SignIn component
- `/app/auth/signup/page.tsx` - Using SignUp component
- `/.env.local` - Added Clerk variables

### New Files (8)
- `/app/api/webhooks/clerk/route.ts` - Webhook handler
- `/lib/supabase/admin.ts` - Admin client (already existed)
- `/supabase/migrations/20250109_clerk_migration.sql` - Schema changes
- `/supabase/migrations/20250109_clerk_database_functions.sql` - DB functions
- `/docs/CLERK_SETUP.md` - Complete setup guide
- `/docs/CLERK_MIGRATION_COMPLETE.md` - Detailed migration notes
- `/docs/TESTING_CHECKLIST.md` - 25-point test plan
- `/docs/ENVIRONMENT_VARIABLES.md` - All env vars documented

### Files to Remove (Optional)
- `/components/auth/google-sign-in-button.tsx` - No longer needed
- `/components/auth/auth-layout.tsx` - No longer needed
- `/app/auth/callback/route.ts` - No longer needed
- `/components/auth/auth-error.tsx` - No longer needed

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─ /auth/login ──────> Clerk SignIn Component
       │                      └─> Google OAuth
       │                          └─> Clerk Authentication
       │                              └─> Webhook to /api/webhooks/clerk
       │                                  └─> Supabase Profile Created
       │
       └─ /dashboard ─────────> Clerk Middleware
                                 └─> Check Authentication
                                     └─> Load from Supabase

User Data Flow:
1. User authenticates with Clerk (Google OAuth)
2. Clerk sends webhook to your app
3. Webhook creates/updates profile in Supabase
4. Dashboard loads user data from Supabase
5. Subscriptions/billing linked to Supabase profile
```

## Quick Commands

```bash
# Start development server
npm run dev

# Test with ngrok (for webhooks)
ngrok http 3000

# Apply database migrations
npx supabase db push

# View Supabase logs
npx supabase logs --db

# Check Clerk webhooks
# Go to: https://dashboard.clerk.com > Webhooks > [Your Endpoint] > Logs
```

## Common Issues

### "Missing CLERK_WEBHOOK_SECRET"
**Fix:** Add webhook secret to `.env.local` from Clerk Dashboard

### "Cannot connect to Supabase"
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

### Webhook returns 500
**Fix:** Check database migrations are applied

### User profile not created
**Fix:**
1. Check webhook logs in Clerk Dashboard
2. Check Supabase logs: `npx supabase logs --db`
3. Verify database functions exist

### Authentication loop
**Fix:** Clear browser cookies and restart server

## Testing Checklist

Minimum tests before going live:

- [ ] Sign up with Google works
- [ ] User redirected to dashboard
- [ ] Profile created in Supabase with correct data
- [ ] Sign out works
- [ ] Sign in works for existing user
- [ ] Protected routes redirect to login
- [ ] Public routes accessible
- [ ] Webhook events show success in Clerk Dashboard
- [ ] Mobile view works
- [ ] No console errors

Full testing: See `/docs/TESTING_CHECKLIST.md` (25 comprehensive tests)

## Documentation

Detailed guides available:

1. **Setup Guide:** `/docs/CLERK_SETUP.md`
   - Step-by-step Clerk configuration
   - Google OAuth setup
   - Webhook configuration
   - Troubleshooting

2. **Migration Details:** `/docs/CLERK_MIGRATION_COMPLETE.md`
   - What changed
   - What stayed the same
   - Testing instructions
   - Rollback plan

3. **Testing Checklist:** `/docs/TESTING_CHECKLIST.md`
   - 25 comprehensive tests
   - Authentication flows
   - Webhook verification
   - UI/UX testing
   - Security tests

4. **Environment Variables:** `/docs/ENVIRONMENT_VARIABLES.md`
   - All variables explained
   - Security best practices
   - Examples for dev/staging/prod

## Production Deployment

Before deploying to production:

### Clerk Configuration
- [ ] Create production Clerk instance
- [ ] Enable Google OAuth with custom credentials
- [ ] Update webhook URL to production domain
- [ ] Switch to live mode keys (pk_live_, sk_live_)

### Environment Variables
- [ ] Set all production env vars in hosting platform
- [ ] Use live mode Clerk keys
- [ ] Use production webhook secret
- [ ] Verify NEXT_PUBLIC_APP_URL is correct

### Database
- [ ] Apply migrations to production Supabase
- [ ] Verify RLS policies
- [ ] Test webhook in production
- [ ] Set up monitoring

### Testing
- [ ] Complete full test suite in production
- [ ] Verify Google OAuth works
- [ ] Test user creation, update, deletion
- [ ] Monitor webhook success rate
- [ ] Check error tracking (Sentry, etc.)

## Support

For issues:

1. Check relevant documentation above
2. Review Clerk Dashboard logs
3. Check Supabase logs
4. Search Clerk documentation: https://clerk.com/docs
5. Join Clerk Discord: https://clerk.com/discord

## Status: MIGRATION COMPLETE ✓

Code migration is complete. You must now:
1. Set up Clerk account
2. Configure environment variables
3. Apply database migrations
4. Test authentication flow

**Estimated time to production-ready:** 1-2 hours
