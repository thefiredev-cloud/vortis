# Clerk Migration - Complete Package

This directory contains all files needed to migrate from Supabase Auth to Clerk authentication.

## What Was Created

### 1. Database Migration Files

**`/supabase/migrations/20251009000006_clerk_migration.sql`**
- Converts all user_id columns from UUID to TEXT
- Adds Clerk-specific columns to profiles table
- Updates RLS policies for service role access
- Creates webhook helper functions
- Removes Supabase Auth dependencies

**`/supabase/migrations/20251009000007_clerk_rollback.sql`**
- Rollback migration if needed
- WARNING: Deletes all Clerk user data
- Only use in emergencies or for testing

### 2. Application Code

**`/lib/supabase/admin.ts`** (NEW)
- Supabase admin client using service role key
- Bypasses RLS for server-side operations
- Safety check prevents client-side usage

**`/lib/subscription-helpers.ts`** (UPDATED)
- Updated to use admin client instead of regular client
- Now works with Clerk user IDs (string format)
- All functions accept Clerk IDs: `"user_2abc123..."`

**`/app/api/webhooks/clerk/route.ts`** (UPDATED)
- Updated to use database functions
- Calls `upsert_user_from_clerk()` and `delete_user_from_clerk()`
- Better error handling and logging

### 3. Documentation

**`/docs/CLERK_MIGRATION_GUIDE.md`**
- Complete step-by-step migration guide
- Phase-by-phase approach
- Code examples for each step
- Troubleshooting section
- Production deployment checklist

**`/docs/CLERK_DB_VERIFICATION.md`**
- SQL queries to verify migration success
- Pre and post-migration checks
- Functional tests for database functions
- Data integrity checks
- Performance verification queries

**`/docs/CLERK_TESTING_CHECKLIST.md`**
- Comprehensive testing checklist
- Pre-migration tests
- Post-migration tests
- Webhook tests
- Security tests
- Production readiness checklist

**`/docs/CLERK_MIGRATION_README.md`** (THIS FILE)
- Overview of all migration files
- Quick reference guide
- File summaries

## Quick Start Guide

### For New Projects (No Existing Users)

1. **Apply Migration**
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or using SQL Editor
   # Copy contents of 20251009000006_clerk_migration.sql and execute
   ```

2. **Set Environment Variables**
   ```bash
   CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   CLERK_WEBHOOK_SECRET=whsec_...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

3. **Configure Clerk Webhook**
   - Go to Clerk Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy signing secret to `CLERK_WEBHOOK_SECRET`

4. **Test**
   - Sign up a test user
   - Check database for new profile
   - Test user flows in your app

### For Existing Projects (With Users)

Follow the complete guide in `/docs/CLERK_MIGRATION_GUIDE.md` - Phase 6 covers user migration.

## Key Changes Summary

### Database Schema Changes

| Table | Column | Old Type | New Type | Notes |
|-------|--------|----------|----------|-------|
| profiles | id | UUID | TEXT | Now stores Clerk user ID |
| subscriptions | user_id | UUID | TEXT | References profiles.id |
| stock_analyses | user_id | UUID | TEXT | References profiles.id |
| usage_tracking | user_id | UUID | TEXT | References profiles.id |
| watchlist | user_id | UUID | TEXT | References profiles.id |
| api_usage | user_id | UUID | TEXT | References profiles.id |

### New Columns in Profiles

- `clerk_user_id` - Clerk user ID (same as id)
- `external_id` - External auth ID (if using external provider)
- `username` - Clerk username
- `first_name` - User first name
- `last_name` - User last name
- `image_url` - Profile image URL

### New Database Functions

```sql
-- Create or update user from Clerk webhook
upsert_user_from_clerk(
  p_clerk_id TEXT,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_image_url TEXT,
  p_username TEXT,
  p_external_id TEXT
)

-- Delete user from Clerk webhook
delete_user_from_clerk(p_clerk_id TEXT)

-- Sync user metadata
sync_clerk_user_metadata(p_clerk_id TEXT, p_metadata JSONB)
```

### RLS Policy Changes

**Before (Supabase Auth):**
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

**After (Clerk + Service Role):**
```sql
CREATE POLICY "Allow service role full access"
  ON profiles FOR ALL
  USING (true);
```

Authorization now handled in application code, not database.

## Code Migration Examples

### Before: Supabase Auth

```typescript
import { createClient } from '@/lib/supabase/server'
import { auth } from '@supabase/auth-helpers-nextjs'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
}
```

### After: Clerk + Admin Client

```typescript
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { userId } = auth() // Clerk user ID

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
}
```

## Environment Variables Needed

```bash
# Clerk (required)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NEW - required for admin client

# Stripe (existing)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Migration Checklist

### Pre-Migration
- [ ] Read `/docs/CLERK_MIGRATION_GUIDE.md`
- [ ] Backup production database
- [ ] Test migration in development
- [ ] Review verification queries
- [ ] Update environment variables
- [ ] Team trained on new flow

### During Migration
- [ ] Apply migration to development
- [ ] Run verification queries
- [ ] Test all user flows
- [ ] Configure Clerk webhooks
- [ ] Test webhook integration
- [ ] Update application code
- [ ] Test build and deploy

### Post-Migration
- [ ] Monitor webhook deliveries
- [ ] Monitor error rates
- [ ] Verify user sign-ups work
- [ ] Test subscription flows
- [ ] Test stock analysis flows
- [ ] Check database performance
- [ ] Document any issues

## Testing

### Manual Testing

1. **User Sign Up**
   - Go to sign-up page
   - Create new user in Clerk
   - Verify profile created in database
   - Check all fields populated correctly

2. **User Sign In**
   - Sign in with test user
   - Verify session works
   - Check profile loads correctly
   - Test protected routes

3. **Webhook Testing**
   - Update user in Clerk dashboard
   - Verify profile updated in database
   - Delete user in Clerk
   - Verify profile deleted from database

### Automated Testing

Run verification queries from `/docs/CLERK_DB_VERIFICATION.md`:

```sql
-- Migration status report
-- Copy from CLERK_DB_VERIFICATION.md
```

## Rollback Plan

If migration fails:

### Option 1: Restore from Backup (Fastest)
```bash
pg_restore -h your-db-host -U postgres -d postgres backup.sql
```

### Option 2: Run Rollback Migration
```bash
psql -h your-db-host -U postgres -d postgres \
  -f supabase/migrations/20251009000007_clerk_rollback.sql
```

**WARNING:** Both options will delete Clerk user data!

## Common Issues

### Issue: Webhook not creating users
**Solution:** Check `CLERK_WEBHOOK_SECRET` is set correctly

### Issue: Type errors with user IDs
**Solution:** User IDs are now strings, not UUIDs. Update type definitions.

### Issue: RLS policy errors
**Solution:** Use `supabaseAdmin` client in server-side code, not regular client.

### Issue: Service role key exposed
**Solution:** Only use in API routes/server actions. Never in client components.

## Support Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Migration Guide](/docs/CLERK_MIGRATION_GUIDE.md)
- [Verification Queries](/docs/CLERK_DB_VERIFICATION.md)
- [Testing Checklist](/docs/CLERK_TESTING_CHECKLIST.md)

## File Structure

```
vortis/
├── app/
│   └── api/
│       └── webhooks/
│           └── clerk/
│               └── route.ts              # Clerk webhook handler (UPDATED)
├── lib/
│   ├── supabase/
│   │   ├── admin.ts                      # Admin client (NEW)
│   │   └── server.ts                     # Regular client (existing)
│   └── subscription-helpers.ts           # Helper functions (UPDATED)
├── supabase/
│   └── migrations/
│       ├── 20251009000006_clerk_migration.sql     # Main migration
│       └── 20251009000007_clerk_rollback.sql      # Rollback migration
└── docs/
    ├── CLERK_MIGRATION_GUIDE.md          # Complete migration guide
    ├── CLERK_DB_VERIFICATION.md          # Verification queries
    ├── CLERK_TESTING_CHECKLIST.md        # Testing checklist
    └── CLERK_MIGRATION_README.md         # This file
```

## Next Steps

1. Read the complete migration guide
2. Test in development environment
3. Run verification queries
4. Complete testing checklist
5. Deploy to production
6. Monitor for 24-48 hours

## Notes

- Always test in development first
- Never skip the backup step
- Monitor webhooks in Clerk dashboard
- Keep service role key secure
- Document any custom changes

## Version History

- **2025-10-09**: Initial migration package created
  - Migration SQL files
  - Updated application code
  - Complete documentation
  - Testing resources

---

**Need Help?**
- Review the migration guide thoroughly
- Check verification queries for diagnostics
- Use testing checklist to ensure completeness
- Contact team lead if issues persist
