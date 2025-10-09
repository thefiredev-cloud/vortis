# Clerk Migration - Quick Reference Card

## TL;DR

Migrating from Supabase Auth (UUID) to Clerk (string IDs). Database schema changes + RLS policy updates required.

## Critical Files

| File | Purpose | Action |
|------|---------|--------|
| `supabase/migrations/20251009000006_clerk_migration.sql` | Main migration | Apply to DB |
| `lib/supabase/admin.ts` | Admin client | Use in API routes |
| `.env.clerk.example` | Env vars template | Copy to `.env.local` |

## Quick Start (New Project)

```bash
# 1. Apply migration
supabase db push

# 2. Set env vars
cp .env.clerk.example .env.local
# Fill in: CLERK_*, SUPABASE_SERVICE_ROLE_KEY

# 3. Configure Clerk webhook
# Dashboard → Webhooks → Add endpoint
# URL: https://your-domain.com/api/webhooks/clerk
# Events: user.created, user.updated, user.deleted

# 4. Test
# Sign up user → Check DB for profile
```

## Code Changes Required

### Before (Supabase Auth)
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### After (Clerk)
```typescript
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const { userId } = auth() // Clerk user ID
const { data } = await supabaseAdmin
  .from('profiles')
  .select('*')
  .eq('id', userId)
```

## Database Changes

| Table | Column | Old Type | New Type |
|-------|--------|----------|----------|
| profiles | id | UUID | TEXT |
| * | user_id | UUID | TEXT |

## New Environment Variables

```bash
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NEW!
```

## Testing Checklist (Essential)

- [ ] Migration runs without errors
- [ ] Webhook creates user profile
- [ ] User can sign up
- [ ] User can sign in
- [ ] Subscriptions work
- [ ] Stock analyses work

## Common Issues

| Problem | Solution |
|---------|----------|
| Webhook not working | Check `CLERK_WEBHOOK_SECRET` |
| Type errors | User IDs are now strings, not UUIDs |
| RLS errors | Use `supabaseAdmin`, not regular client |
| Service role exposed | Only use in API routes/server actions |

## Rollback (Emergency)

```bash
# Restore from backup (recommended)
pg_restore backup.sql

# Or run rollback migration
psql -f supabase/migrations/20251009000007_clerk_rollback.sql
```

WARNING: Rollback deletes all Clerk user data!

## Verification Query

```sql
-- Check migration succeeded
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name IN ('id', 'user_id')
  AND table_schema = 'public';

-- All should be 'text', not 'uuid'
```

## Security Checklist

- [ ] Service role key NOT in version control
- [ ] Service role key NOT in client code
- [ ] Webhook signatures verified
- [ ] RLS still enabled
- [ ] Client-side uses Clerk only

## Documentation

- Full guide: `/docs/CLERK_MIGRATION_GUIDE.md`
- Verification: `/docs/CLERK_DB_VERIFICATION.md`
- Testing: `/docs/CLERK_TESTING_CHECKLIST.md`

## Support

- Clerk Docs: https://clerk.com/docs
- Supabase Docs: https://supabase.com/docs
- Migration README: `/docs/CLERK_MIGRATION_README.md`

---

**Status:** Ready for testing
**Time:** ~2 hours dev + testing
**Risk:** Medium (reversible)
