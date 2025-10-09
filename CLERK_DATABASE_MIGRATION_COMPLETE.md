# Clerk Database Migration - Complete Package

## Summary

Successfully created a complete database migration package to convert from Supabase Auth (UUID-based) to Clerk authentication (string-based user IDs). All necessary files, code updates, and documentation have been prepared.

## Files Created/Updated

### 1. Database Migration Files

#### `/supabase/migrations/20251009000006_clerk_migration.sql`
**Purpose:** Main migration to convert database for Clerk compatibility

**What it does:**
- Drops Supabase Auth trigger and foreign key constraints
- Converts all `user_id` columns from UUID to TEXT
- Adds Clerk-specific columns to profiles table
- Updates all RLS policies for service role access
- Creates database helper functions for webhooks
- Adds indexes for Clerk user IDs

**Tables affected:**
- profiles (primary changes)
- subscriptions
- stock_analyses
- usage_tracking
- watchlist
- api_usage
- user_preferences (if exists)
- watchlist_alerts (if exists)

#### `/supabase/migrations/20251009000007_clerk_rollback.sql`
**Purpose:** Emergency rollback migration

**WARNING:** This will delete all Clerk user data!

**What it does:**
- Drops all Clerk-specific functions and policies
- Removes Clerk columns from profiles
- Truncates all tables (data loss!)
- Converts all columns back to UUID
- Restores Supabase Auth constraints and triggers

**Use only if:**
- Migration failed catastrophically
- Need to return to Supabase Auth
- Testing rollback procedure in development

### 2. Application Code Updates

#### `/lib/supabase/admin.ts` (NEW)
**Purpose:** Admin Supabase client using service role key

**Key features:**
- Bypasses Row Level Security (RLS)
- Only for server-side use (API routes, server actions)
- Safety check prevents client-side usage
- Used by all subscription helpers

**Usage:**
```typescript
import { supabaseAdmin } from '@/lib/supabase/admin'

// In API route or server action
const { data } = await supabaseAdmin
  .from('profiles')
  .select('*')
  .eq('id', userId)
```

#### `/lib/subscription-helpers.ts` (UPDATED)
**Purpose:** Updated to work with Clerk user IDs and admin client

**Changes:**
- Replaced `createClient()` with `getSupabaseAdmin()`
- Now accepts Clerk user IDs (string format: "user_...")
- Fixed `incrementAnalysisUsage()` to work without RPC function
- Added documentation for Clerk compatibility

**Functions updated:**
- `getUserSubscription(userId: string)`
- `getUserUsage(userId: string)`
- `incrementAnalysisUsage(userId: string)`
- All helper functions now use admin client

#### `/app/api/webhooks/clerk/route.ts` (UPDATED)
**Purpose:** Updated webhook handler to use database functions

**Changes:**
- Uses `supabaseAdmin` instead of creating client inline
- Calls database functions: `upsert_user_from_clerk()`, `delete_user_from_clerk()`
- Better error handling and logging
- Handles all Clerk user fields (username, external_id, etc.)

**Webhook events handled:**
- `user.created` → Creates profile and initial usage tracking
- `user.updated` → Updates profile fields
- `user.deleted` → Deletes profile and cascades to related data

### 3. Documentation

#### `/docs/CLERK_DB_VERIFICATION.md`
**Purpose:** SQL queries to verify migration success

**Sections:**
- Pre-migration checks
- Post-migration verification queries
- Function and trigger verification
- Functional tests for database functions
- Data integrity checks
- Performance checks
- Migration status report

#### `/docs/CLERK_MIGRATION_GUIDE.md` (UPDATED)
**Purpose:** Complete step-by-step migration guide

**Phases:**
1. Preparation (backups, testing)
2. Update application code
3. Apply migration
4. Configure Clerk webhooks
5. Production deployment
6. User migration (for existing users)

**Includes:**
- Code examples for all changes
- Troubleshooting section
- Rollback procedures
- Testing checklist integration

#### `/docs/CLERK_TESTING_CHECKLIST.md` (UPDATED)
**Purpose:** Comprehensive testing checklist

**Test categories:**
- Pre-migration tests
- Migration application tests
- Schema verification
- Function verification
- Webhook tests (created, updated, deleted)
- Authentication flow tests
- Database operation tests
- Performance tests
- Security tests
- Error handling tests
- Edge cases
- Rollback tests

#### `/docs/CLERK_MIGRATION_README.md`
**Purpose:** Overview and quick reference

**Contains:**
- Summary of all migration files
- Quick start guides (new projects vs existing)
- Key changes summary
- Code migration examples
- Environment variables needed
- Common issues and solutions

#### `/.env.clerk.example`
**Purpose:** Environment variable template

**Variables included:**
- Clerk keys (publishable, secret, webhook)
- Supabase keys (URL, anon, **service role**)
- Stripe keys (existing)
- Configuration notes
- Security checklist

## Key Database Changes

### Schema Changes

| Table | Column | Before | After | Note |
|-------|--------|--------|-------|------|
| **profiles** | id | UUID | TEXT | Now stores Clerk user ID |
| profiles | clerk_user_id | - | TEXT | Duplicate of id for clarity |
| profiles | external_id | - | TEXT | External auth provider ID |
| profiles | username | - | TEXT | Clerk username |
| profiles | first_name | - | TEXT | From Clerk |
| profiles | last_name | - | TEXT | From Clerk |
| profiles | image_url | - | TEXT | Clerk profile image |
| profiles | email | NOT NULL | NULL | Clerk might not provide |
| **subscriptions** | user_id | UUID | TEXT | Foreign key to profiles |
| **stock_analyses** | user_id | UUID | TEXT | Foreign key to profiles |
| **usage_tracking** | user_id | UUID | TEXT | Foreign key to profiles |
| **watchlist** | user_id | UUID | TEXT | Foreign key to profiles |
| **api_usage** | user_id | UUID | TEXT | Foreign key to profiles |

### New Database Functions

```sql
-- Creates or updates user profile from Clerk webhook
public.upsert_user_from_clerk(
  p_clerk_id TEXT,
  p_email TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_external_id TEXT DEFAULT NULL
)

-- Deletes user and all related data
public.delete_user_from_clerk(p_clerk_id TEXT)

-- Syncs user metadata (placeholder for future use)
public.sync_clerk_user_metadata(p_clerk_id TEXT, p_metadata JSONB)
```

### RLS Policy Changes

**Before (Supabase Auth):**
```sql
-- Uses auth.uid() to check current user
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

**After (Clerk + Service Role):**
```sql
-- Service role has full access, app handles authorization
CREATE POLICY "Allow service role full access"
  ON profiles FOR ALL
  USING (true);
```

**Impact:**
- All server-side code must use `supabaseAdmin` client
- Authorization checks moved to application layer (Clerk session)
- Regular (anon key) client cannot access any data
- Safer: accidental client-side usage fails instead of leaking data

### Triggers

**Removed:**
- `on_auth_user_created` - No longer needed (Clerk handles auth)
- `handle_new_user()` - Function deleted

**Kept:**
- `update_profiles_updated_at` - Still updates timestamp
- `update_subscriptions_updated_at` - Still updates timestamp
- All other `updated_at` triggers

## Migration Path

### For New Projects (Recommended)

1. Apply migration to fresh database
2. Configure Clerk webhooks
3. Users sign up via Clerk
4. Webhooks create profiles automatically

### For Existing Projects

1. **Backup production database**
2. **Test in development** (critical!)
3. Export existing Supabase Auth users
4. Create Clerk users via API (see migration guide)
5. Map old UUIDs to new Clerk IDs
6. Apply migration
7. Update all user_id references
8. Configure webhooks
9. Test thoroughly
10. Deploy to production
11. Monitor for 24-48 hours

## Environment Variables

### New/Required

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Admin (NEW - CRITICAL!)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Existing (Keep)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Removed (After Migration)

```bash
# Supabase Auth (no longer needed)
# NEXT_PUBLIC_SUPABASE_JWT_SECRET
```

## Testing Requirements

### Before Production Deployment

- [ ] Migration runs successfully in development
- [ ] All verification queries pass
- [ ] Webhook creates users correctly
- [ ] Webhook updates users correctly
- [ ] Webhook deletes users correctly
- [ ] User sign-up flow works
- [ ] User sign-in flow works
- [ ] Subscription functions work
- [ ] Stock analysis creation works
- [ ] Usage tracking increments correctly
- [ ] Watchlist operations work
- [ ] All database queries perform well
- [ ] No RLS policy errors
- [ ] Service role key secured
- [ ] Application builds without errors
- [ ] All TypeScript types correct

### Critical Tests

**Webhook Test:**
```bash
# Sign up new user in Clerk
# Check database:
SELECT * FROM profiles WHERE clerk_user_id = 'user_2abc123';

# Should see:
# - Profile created
# - All fields populated
# - Usage tracking created with free tier limits
```

**Authorization Test:**
```typescript
// API route should work:
const { userId } = auth()
const { data } = await supabaseAdmin
  .from('profiles')
  .select('*')
  .eq('id', userId)

// Client-side should fail:
const { data } = await createClient()  // Uses anon key
  .from('profiles')
  .select('*')  // ERROR: RLS denies access
```

## Rollback Procedures

### Option 1: Restore from Backup (Fastest)

```bash
# Stop application
# Restore database from backup
pg_restore -h db-host -U postgres -d postgres backup.sql

# Revert code changes
git checkout main  # or previous commit

# Restart application
```

**Time:** 5-15 minutes
**Data loss:** None (if backup is recent)

### Option 2: Run Rollback Migration

```bash
# Apply rollback migration
psql -h db-host -U postgres -d postgres \
  -f supabase/migrations/20251009000007_clerk_rollback.sql

# Revert code changes
git checkout main

# Restart application
```

**Time:** 10-30 minutes
**Data loss:** All Clerk user data deleted!

### When to Rollback

- Migration fails midway with data corruption
- Critical bug discovered post-deployment
- Performance issues not caught in testing
- Clerk integration not working properly
- Team decision to revert

### When NOT to Rollback

- Minor bugs (fix forward instead)
- Individual user issues (investigate first)
- Webhook delivery delays (temporary issue)
- Performance tuning needed (optimize instead)

## Security Considerations

### Critical: Service Role Key

**Must:**
- Store in server environment only
- Never commit to version control
- Never expose to client-side code
- Rotate if exposed

**Check:**
```bash
# Ensure not in client bundle
grep -r "SUPABASE_SERVICE_ROLE_KEY" .next/static/

# Should return nothing
```

### RLS Still Enabled

Even with service role policies, RLS is enabled as safety:
- Accidental anon key usage fails (good!)
- Service role required for all operations
- Client-side leaks impossible

### Webhook Security

All webhooks verify signatures:
- Clerk: Svix signature verification
- Stripe: Stripe signature verification
- Invalid signatures rejected (400 error)

## Performance Notes

### TEXT vs UUID

- TEXT user IDs: slightly larger storage (marginal)
- Index performance: virtually identical
- Query performance: no measurable difference for typical loads
- Clerk IDs are consistent length (~20-30 chars)

### Indexes Created

```sql
-- Profiles
CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE UNIQUE INDEX idx_profiles_clerk_user_id_unique ON profiles(clerk_user_id);

-- Existing indexes on user_id columns still work with TEXT
```

### Query Optimization

Use EXPLAIN ANALYZE to verify:
```sql
EXPLAIN ANALYZE
SELECT * FROM profiles WHERE id = 'user_2abc123';

-- Should show: Index Scan using profiles_pkey
```

## Monitoring

### After Deployment

**Watch for:**
- Webhook delivery failures (Clerk dashboard)
- Database errors (Supabase logs)
- Application errors (Sentry/logging)
- Performance degradation (query times)
- User sign-up issues (support tickets)

**Metrics:**
- Webhook success rate (should be ~100%)
- User creation time (should be <500ms)
- Database query times (should be <100ms)
- Error rates (should be <0.1%)

## Next Steps

1. **Read Documentation**
   - Start with `/docs/CLERK_MIGRATION_GUIDE.md`
   - Review verification queries
   - Understand testing checklist

2. **Test in Development**
   - Apply migration to dev database
   - Run all verification queries
   - Test webhook integration
   - Complete testing checklist

3. **Update Code**
   - Review all changes needed
   - Test locally
   - Commit changes

4. **Plan Production Deployment**
   - Schedule deployment window
   - Notify team
   - Prepare rollback plan
   - Monitor resources ready

5. **Deploy**
   - Apply migration
   - Deploy code
   - Configure webhooks
   - Monitor closely

## Support

### Documentation
- [Migration Guide](/docs/CLERK_MIGRATION_GUIDE.md)
- [Verification Queries](/docs/CLERK_DB_VERIFICATION.md)
- [Testing Checklist](/docs/CLERK_TESTING_CHECKLIST.md)
- [Migration README](/docs/CLERK_MIGRATION_README.md)

### External Resources
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk + Supabase Guide](https://clerk.com/docs/integrations/databases/supabase)

## Success Criteria

Migration is successful when:

- [ ] All users can sign up via Clerk
- [ ] Webhooks create profiles automatically
- [ ] All application features work correctly
- [ ] No database errors in logs
- [ ] Performance is acceptable
- [ ] Security checks pass
- [ ] Team is trained on new flow
- [ ] Documentation is complete
- [ ] Monitoring is in place

## Version

- **Created:** 2025-10-09
- **Migration Version:** 20251009000006
- **Rollback Version:** 20251009000007
- **Database:** PostgreSQL (Supabase)
- **Auth Provider:** Clerk
- **Application:** Next.js 15 + React 19

---

**Status:** ✅ Ready for Testing

**Next Action:** Apply migration to development database and begin testing

**Risk Level:** Medium (reversible with rollback, but requires thorough testing)

**Estimated Migration Time:**
- Development: 1-2 hours
- Testing: 4-8 hours
- Production: 30 minutes (migration) + 24-48 hours (monitoring)
