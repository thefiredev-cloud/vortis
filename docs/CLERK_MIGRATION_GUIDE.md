# Clerk Database Migration Guide

## Overview

This guide walks through migrating from Supabase Auth to Clerk authentication while maintaining your existing database structure and user data.

## Prerequisites

- [ ] Clerk account set up
- [ ] Clerk publishable and secret keys
- [ ] Supabase service role key
- [ ] Backup of production database
- [ ] Test environment to verify migration

## Migration Strategy

### Option A: Fresh Start (Recommended for New Projects)
1. Apply migration to empty database
2. Users will be created via Clerk webhooks as they sign up

### Option B: Migrate Existing Users (For Existing Projects)
1. Export existing Supabase Auth users
2. Create corresponding Clerk users via API
3. Map old UUIDs to new Clerk IDs
4. Apply migration
5. Update all user references

## Step-by-Step Migration

### Phase 1: Preparation

#### 1. Backup Your Database

```bash
# Using Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d).sql

# Or using psql
pg_dump -h your-db-host -U postgres -d postgres > backup.sql
```

#### 2. Test in Development First

**CRITICAL: Never run migrations directly on production without testing!**

Apply to your development/staging database first:

```bash
# Using Supabase CLI
supabase db reset  # Reset dev database
supabase db push   # Apply all migrations
```

#### 3. Review Migration File

Read through `/supabase/migrations/20251009000006_clerk_migration.sql` to understand what will change:

- Profiles table: `id` changes from UUID to TEXT
- All foreign keys: `user_id` changes from UUID to TEXT
- RLS policies: Updated to use service role instead of `auth.uid()`
- New columns: `clerk_user_id`, `first_name`, `last_name`, etc.
- New functions: Webhook handlers for Clerk

### Phase 2: Update Application Code

#### 1. Update Supabase Client Configuration

Create a new Supabase client for server-side operations:

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

#### 2. Update User Type Definitions

```typescript
// types/database.ts
export interface Profile {
  id: string // Changed from UUID to string
  clerk_user_id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  full_name: string | null
  image_url: string | null
  username: string | null
  external_id: string | null
  created_at: string
  updated_at: string
  // ... other fields
}
```

#### 3. Update Subscription Helpers

The file `/lib/subscription-helpers.ts` already uses `userId: string`, so minimal changes needed:

```typescript
// lib/subscription-helpers.ts
import { supabaseAdmin } from '@/lib/supabase/admin'

// Replace all instances of `createClient()` with `supabaseAdmin`
export async function getUserSubscription(
  userId: string // Already accepts string, so Clerk IDs work
): Promise<UserSubscription | null> {
  const { data, error } = await supabaseAdmin // Use admin client
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  // ... rest of function
}
```

#### 4. Create Clerk Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  // Get headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, username, external_id } = evt.data

    const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)

    // Call Supabase function to upsert user
    const { error } = await supabaseAdmin.rpc('upsert_user_from_clerk', {
      p_clerk_id: id,
      p_email: primaryEmail?.email_address || null,
      p_first_name: first_name || null,
      p_last_name: last_name || null,
      p_image_url: image_url || null,
      p_username: username || null,
      p_external_id: external_id || null
    })

    if (error) {
      console.error('Error upserting user:', error)
      return new Response('Error upserting user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    const { error } = await supabaseAdmin.rpc('delete_user_from_clerk', {
      p_clerk_id: id
    })

    if (error) {
      console.error('Error deleting user:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
```

#### 5. Update API Routes to Use Admin Client

```typescript
// Example: app/api/analysis/route.ts
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { userId } = auth() // Get Clerk user ID

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role client (bypasses RLS)
  const { data, error } = await supabaseAdmin
    .from('stock_analyses')
    .insert({
      user_id: userId, // Clerk user ID (string)
      ticker: 'AAPL',
      // ... other fields
    })

  // ...
}
```

### Phase 3: Apply Migration

#### 1. Apply to Development Database

```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Using SQL Editor in Supabase Dashboard
# 1. Open SQL Editor
# 2. Copy contents of 20251009000006_clerk_migration.sql
# 3. Execute

# Option C: Using psql
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20251009000006_clerk_migration.sql
```

#### 2. Run Verification Queries

Follow the checks in `/docs/CLERK_DB_VERIFICATION.md`:

```bash
# Open Supabase SQL Editor or psql
# Run the "Migration Status Report" query from the verification doc
```

#### 3. Test Application Functionality

- [ ] User sign up creates profile
- [ ] User sign in works
- [ ] User can create stock analysis
- [ ] Subscription data loads correctly
- [ ] Watchlist functions properly
- [ ] User preferences save correctly

### Phase 4: Configure Clerk Webhooks

#### 1. Set Up Clerk Webhook Endpoint

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy webhook signing secret
5. Add to environment variables: `CLERK_WEBHOOK_SECRET`

#### 2. Test Webhook Locally

```bash
# Install Clerk CLI
npm install -g @clerk/clerk-cli

# Forward webhooks to local dev server
clerk webhooks forward --webhook-url http://localhost:3000/api/webhooks/clerk
```

#### 3. Verify Webhook Processing

1. Sign up a test user in Clerk
2. Check your webhook endpoint logs
3. Query database to verify profile was created:

```sql
SELECT * FROM public.profiles WHERE clerk_user_id = 'user_...';
```

### Phase 5: Production Deployment

#### 1. Final Checks

- [ ] All tests passing in development
- [ ] Webhooks tested and working
- [ ] Backup of production database created
- [ ] Rollback plan reviewed
- [ ] Team notified of deployment window

#### 2. Apply Migration to Production

**Recommended approach:**

1. Enable maintenance mode (if possible)
2. Apply migration during low-traffic period
3. Monitor for errors
4. Test critical user flows
5. Disable maintenance mode

```bash
# Connect to production database
psql -h your-production-db-host -U postgres -d postgres

# Run migration
\i supabase/migrations/20251009000006_clerk_migration.sql

# Verify
SELECT * FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'clerk_user_id';
```

#### 3. Deploy Application Updates

```bash
# Ensure environment variables are set
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Deploy to your platform (Vercel, Railway, etc.)
git push production main
```

#### 4. Monitor Deployment

- [ ] Check application logs for errors
- [ ] Monitor webhook delivery in Clerk dashboard
- [ ] Test user sign-up flow
- [ ] Verify database writes are working
- [ ] Check error tracking (Sentry, etc.)

### Phase 6: User Migration (If Migrating Existing Users)

If you have existing Supabase Auth users:

#### 1. Export Supabase Users

```sql
-- Export user data
COPY (
  SELECT
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
  FROM auth.users
) TO '/tmp/users_export.csv' WITH CSV HEADER;
```

#### 2. Create Clerk Users via API

```typescript
// scripts/migrate-users.ts
import { clerkClient } from '@clerk/nextjs/server'
import fs from 'fs'
import csv from 'csv-parser'

interface SupabaseUser {
  id: string
  email: string
  full_name: string
  created_at: string
}

async function migrateUsers() {
  const users: SupabaseUser[] = []

  // Read CSV
  fs.createReadStream('users_export.csv')
    .pipe(csv())
    .on('data', (row) => users.push(row))
    .on('end', async () => {
      for (const user of users) {
        try {
          // Create user in Clerk
          const clerkUser = await clerkClient.users.createUser({
            emailAddress: [user.email],
            firstName: user.full_name?.split(' ')[0],
            lastName: user.full_name?.split(' ').slice(1).join(' '),
            skipPasswordRequirement: true,
          })

          console.log(`Migrated: ${user.email} → ${clerkUser.id}`)

          // Store mapping for reference
          fs.appendFileSync('user_mapping.csv',
            `${user.id},${clerkUser.id}\n`
          )
        } catch (error) {
          console.error(`Failed to migrate ${user.email}:`, error)
        }
      }
    })
}

migrateUsers()
```

#### 3. Update References (If Needed)

If you have existing data, you'll need to update user_id references:

```sql
-- Example: Update subscriptions with new Clerk IDs
-- Use the mapping file created above

UPDATE public.subscriptions
SET user_id = new_clerk_id
WHERE user_id = old_uuid;
```

## Rollback Plan

If something goes wrong:

### 1. Quick Rollback (Restore from Backup)

```bash
# Restore database from backup
pg_restore -h your-db-host -U postgres -d postgres backup.sql
```

### 2. Full Rollback (Use Rollback Migration)

```bash
# Apply rollback migration
psql -h your-db-host -U postgres -d postgres \
  -f supabase/migrations/20251009000007_clerk_rollback.sql
```

**WARNING:** Rollback migration will delete all Clerk user data!

## Troubleshooting

### Issue: Webhook Not Creating Users

**Check:**
1. Webhook secret is correct in environment variables
2. Webhook endpoint is accessible (not localhost in production)
3. Check Clerk dashboard for webhook delivery failures
4. Check application logs for errors

### Issue: RLS Policy Errors

**Solution:** Ensure you're using service role key in server-side code:

```typescript
// ❌ Wrong: Uses anon key, RLS blocks access
const supabase = createClient()

// ✅ Correct: Uses service role, bypasses RLS
const supabase = supabaseAdmin
```

### Issue: Type Errors with User IDs

**Solution:** Update type definitions to accept string instead of UUID:

```typescript
// ❌ Old
userId: UUID

// ✅ New
userId: string
```

### Issue: Foreign Key Constraint Errors

**Check:** Ensure all related tables were updated to TEXT:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE column_name = 'user_id'
  AND table_schema = 'public';
```

All should be `text`, not `uuid`.

## Testing Checklist

After migration, test these flows:

- [ ] User sign up creates profile in database
- [ ] User sign in works correctly
- [ ] User profile displays correctly
- [ ] User can create stock analysis
- [ ] User can view their analyses
- [ ] User can manage watchlist
- [ ] Subscription status displays correctly
- [ ] Usage tracking increments correctly
- [ ] User preferences save correctly
- [ ] User can delete account (webhook deletes data)
- [ ] Admin functions work (if applicable)

## Performance Considerations

### Indexes

The migration creates these indexes:
- `idx_profiles_clerk_user_id` - For fast lookups by Clerk ID
- `idx_profiles_email` - For email lookups (partial index)

Monitor query performance after migration:

```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Query Performance

TEXT vs UUID performance is negligible for most use cases. If you have millions of users, monitor:

```sql
EXPLAIN ANALYZE
SELECT * FROM profiles WHERE id = 'user_2abc123';
```

Ensure "Index Scan" is used, not "Seq Scan".

## Security Considerations

### Service Role Key

**CRITICAL:** Never expose service role key to client-side code!

- ✅ Use in API routes (server-side)
- ✅ Use in server actions
- ✅ Use in Clerk webhooks
- ❌ Never in client components
- ❌ Never in environment variables exposed to browser

### RLS Still Enabled

Even though policies allow service role full access, RLS is still enabled as a safety measure. If you accidentally use anon key, queries will fail rather than exposing data.

### Webhook Security

Always verify Clerk webhook signatures:

```typescript
// ✅ Verify signature
const wh = new Webhook(WEBHOOK_SECRET)
const evt = wh.verify(body, headers)

// ❌ Don't skip verification
```

## Next Steps

After successful migration:

1. Remove Supabase Auth dependencies from package.json
2. Delete unused auth components
3. Update documentation
4. Train team on new authentication flow
5. Monitor for issues in first few days
6. Consider setting up automated backups

## Support Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Migration Verification Guide](/docs/CLERK_DB_VERIFICATION.md)
- Your team's support channel

## FAQ

**Q: Can I keep Supabase Auth and Clerk?**
A: Not recommended. Choose one to avoid confusion and maintain data consistency.

**Q: Will this affect my existing users?**
A: Yes, if you have existing users, you need to migrate them (see Phase 6).

**Q: Can I rollback after migration?**
A: Yes, but you'll lose Clerk user data. Always test in development first.

**Q: Do I need to change my frontend code?**
A: Yes, replace Supabase Auth hooks with Clerk hooks (`useAuth()`, `useUser()`, etc.).

**Q: What about API rate limiting?**
A: Clerk has its own rate limits. Your custom rate limiting in Supabase (usage_tracking) still works.

**Q: Can I use Clerk's built-in user metadata?**
A: Yes, but syncing to Supabase profiles table gives you more flexibility for queries and joins.
