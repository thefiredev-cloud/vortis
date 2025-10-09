# Vortis Database Deployment Guide

Complete guide to deploying the Vortis database schema to Supabase.

---

## Prerequisites

1. **Supabase Project**
   - Active Supabase project
   - Project reference ID
   - Service role key (for migrations)

2. **Tools**
   - Supabase CLI (recommended): `npm install -g supabase`
   - OR access to Supabase Dashboard SQL Editor

3. **Permissions**
   - Admin access to Supabase project
   - Ability to execute SQL migrations

---

## Quick Start (New Project)

### Step 1: Link to Supabase Project

```bash
# Login to Supabase
supabase login

# Link to your project (replace with your project ref)
supabase link --project-ref your-project-ref

# Pull current schema (to see existing state)
supabase db pull
```

### Step 2: Apply Base Schema

The base schema (`schema.sql`) may already be applied. Check first:

```sql
-- In Supabase SQL Editor, run:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

If you see `profiles`, `subscriptions`, `stock_analyses`, `usage_tracking`, the base schema is already applied. Otherwise:

```bash
# Apply base schema
supabase db execute --file supabase/schema.sql
```

### Step 3: Apply Migration Files

Apply the new migrations in order:

```bash
# Migration 1: Enhance core schema
supabase db execute --file supabase/migrations/20251009000001_enhance_core_schema.sql

# Migration 2: API usage tracking
supabase db execute --file supabase/migrations/20251009000002_create_api_usage_table.sql

# Migration 3: User preferences
supabase db execute --file supabase/migrations/20251009000003_create_user_preferences_table.sql

# Migration 4: Watchlist alerts
supabase db execute --file supabase/migrations/20251009000004_create_watchlist_alerts_table.sql

# Migration 5: Admin views and functions
supabase db execute --file supabase/migrations/20251009000005_create_admin_views_functions.sql
```

### Step 4: Verify Deployment

```bash
# Generate TypeScript types (optional, already created)
supabase gen types typescript --project-id your-project-ref > lib/supabase/types.ts

# Run verification queries
supabase db execute --file supabase/verification.sql
```

---

## Deployment Options

### Option A: Supabase CLI (Recommended)

**Pros:**
- Version controlled
- Repeatable
- Can be automated
- Tracks migration history

**Steps:**
```bash
cd /Users/tannerosterkamp/vortis

# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase db push --file supabase/migrations/20251009000001_enhance_core_schema.sql
```

### Option B: SQL Editor (Manual)

**Pros:**
- No CLI setup required
- Direct visual feedback
- Easy for one-time deployments

**Steps:**
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Create new query
4. Copy/paste migration file contents
5. Execute
6. Verify output (no errors)

### Option C: GitHub Actions (CI/CD)

**Pros:**
- Fully automated
- Runs on every deploy
- Consistent across environments

**Setup:**
```yaml
# .github/workflows/deploy-db.yml
name: Deploy Database

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Link to Supabase
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Apply migrations
        run: supabase db push
```

---

## Environment-Specific Deployments

### Development Environment

```bash
# Use development project
supabase link --project-ref dev-project-ref

# Apply migrations
supabase db push

# Seed with test data
supabase db execute --file supabase/seed.sql
```

### Staging Environment

```bash
# Use staging project
supabase link --project-ref staging-project-ref

# Apply migrations
supabase db push

# Verify
npm run test:db
```

### Production Environment

```bash
# Use production project
supabase link --project-ref prod-project-ref

# Backup first (automatic with Supabase Pro)
# Verify migration on staging first!

# Apply migrations
supabase db push

# Verify deployment
npm run verify:db:production
```

---

## Verification Checklist

After deployment, verify everything is working:

### 1. Check Tables

```sql
SELECT
  t.table_name,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;
```

Expected tables (8):
- api_usage
- profiles
- stock_analyses
- subscriptions
- usage_tracking
- user_preferences
- watchlist
- watchlist_alerts

### 2. Check Functions

```sql
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Expected functions (13):
- calculate_mrr
- check_rate_limit
- check_watchlist_alerts
- cleanup_old_api_logs
- get_api_usage_stats
- get_churn_analytics
- get_user_activity_summary
- get_user_preferences
- handle_new_user
- initialize_user_preferences
- refresh_subscription_analytics
- reset_monthly_usage
- trigger_alert
- update_updated_at_column

### 3. Check Views

```sql
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type IN ('VIEW', 'MATERIALIZED VIEW')
ORDER BY table_name;
```

Expected views (3):
- subscription_analytics (MATERIALIZED VIEW)
- top_analyzed_stocks (VIEW)
- usage_analytics (VIEW)

### 4. Check RLS Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should see policies for all tables (SELECT, INSERT, UPDATE, DELETE).

### 5. Check Indexes

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Should see 30+ indexes.

### 6. Test Basic Operations

```typescript
// Test profile creation
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)
  .single()

// Test subscription query
const { data: subscription, error: subError } = await supabase
  .from('subscriptions')
  .select('*')
  .limit(1)

// Test function call
const { data: preferences, error: prefError } = await supabase
  .rpc('get_user_preferences', { p_user_id: 'some-uuid' })

console.log('Database verification:', {
  profilesOk: !profileError,
  subscriptionsOk: !subError,
  functionsOk: !prefError,
})
```

---

## Rollback Procedures

### Rollback Specific Migration

If a migration fails or needs to be reverted:

```bash
# Example: Rollback migration 5
supabase db execute --file supabase/rollback/20251009000005_rollback.sql
```

**Rollback SQL for Migration 5:**
```sql
-- See migrations/README.md for complete rollback scripts
DROP MATERIALIZED VIEW IF EXISTS subscription_analytics CASCADE;
DROP VIEW IF EXISTS usage_analytics CASCADE;
DROP VIEW IF EXISTS top_analyzed_stocks CASCADE;
-- ... (see README.md for complete rollback)
```

### Full Database Reset (Development Only)

```bash
# WARNING: This deletes ALL data
supabase db reset

# Then reapply all migrations
supabase db push
```

---

## Troubleshooting

### Issue: "permission denied for table"

**Cause:** RLS policy blocking access

**Solution:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Temporarily disable RLS for testing (dev only)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

### Issue: "function does not exist"

**Cause:** Migration not applied or wrong signature

**Solution:**
```sql
-- Check function exists
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'your_function_name';

-- Reapply migration
supabase db execute --file supabase/migrations/20251009000002_create_api_usage_table.sql
```

### Issue: "relation already exists"

**Cause:** Migration already applied

**Solution:**
```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'your_table';

-- If exists, skip migration or apply only new parts
```

### Issue: "duplicate key value"

**Cause:** Unique constraint violation

**Solution:**
```sql
-- Find duplicates
SELECT user_id, ticker, COUNT(*)
FROM watchlist
GROUP BY user_id, ticker
HAVING COUNT(*) > 1;

-- Clean up duplicates before applying constraint
DELETE FROM watchlist
WHERE id NOT IN (
  SELECT MIN(id)
  FROM watchlist
  GROUP BY user_id, ticker
);
```

---

## Performance Optimization

### After Deployment

1. **Analyze Tables**
   ```sql
   ANALYZE;
   ```

2. **Check Query Performance**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM stock_analyses WHERE user_id = 'some-uuid';
   ```

3. **Monitor Slow Queries**
   ```sql
   -- Enable pg_stat_statements
   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

   -- View slow queries
   SELECT query, calls, mean_time, total_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

4. **Refresh Materialized Views**
   ```sql
   SELECT refresh_subscription_analytics();
   ```

---

## Maintenance Tasks

### Daily (Automated)

- Automatic backups (Supabase handles this)
- Monitor error logs

### Weekly (Automated via Cron)

```sql
-- Clean up old API logs
SELECT cleanup_old_api_logs(90);
```

### Monthly (Automated via Cron)

```sql
-- Reset monthly usage
SELECT reset_monthly_usage();

-- Refresh subscription analytics
SELECT refresh_subscription_analytics();

-- Generate usage report
SELECT * FROM usage_analytics
WHERE usage_level IN ('at_limit', 'high');
```

### Quarterly (Manual)

- Review and optimize slow queries
- Analyze table growth
- Adjust indexes based on query patterns
- Review and update RLS policies

---

## Monitoring

### Key Metrics to Track

1. **Table Sizes**
   ```sql
   SELECT
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

2. **Index Usage**
   ```sql
   SELECT
     schemaname,
     tablename,
     indexname,
     idx_scan
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY idx_scan ASC;
   ```

3. **Active Connections**
   ```sql
   SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';
   ```

4. **Cache Hit Ratio**
   ```sql
   SELECT
     sum(heap_blks_read) as heap_read,
     sum(heap_blks_hit)  as heap_hit,
     sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
   FROM pg_statio_user_tables;
   ```

---

## Security Considerations

### 1. RLS Policies

Ensure all tables have RLS enabled:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
```

Should return 0 rows.

### 2. Function Security

Verify SECURITY DEFINER functions are safe:
```sql
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND security_type = 'DEFINER';
```

### 3. Sensitive Data

Ensure sensitive columns are not exposed:
- Never log passwords or API keys
- Encrypt sensitive data at rest
- Use service role key only server-side

### 4. API Keys

Protect Supabase keys:
- Use anon key for client-side
- Use service role key for server-side only
- Rotate keys periodically
- Never commit keys to git

---

## Documentation

**Complete documentation set:**

1. **DATABASE_SCHEMA.md** - Detailed schema documentation
2. **SCHEMA_DIAGRAM.md** - Visual entity relationships
3. **QUERY_EXAMPLES.md** - TypeScript query examples
4. **migrations/README.md** - Migration execution guide
5. **DEPLOYMENT_GUIDE.md** (this file) - Deployment procedures

**TypeScript Types:**
- `lib/supabase/types.ts` - Auto-generated types for all tables

---

## Support

For deployment issues:

1. Check Supabase logs in Dashboard
2. Review error messages in SQL output
3. Consult migration README for troubleshooting
4. Test on staging environment first
5. Verify RLS policies are correct

**Emergency Rollback:**
```bash
# Restore from Supabase automatic backup
# Go to Dashboard → Database → Backups
# Select backup point and restore
```

---

## Next Steps

After successful deployment:

1. Update application code to use new tables
2. Test all features with new schema
3. Monitor performance metrics
4. Set up automated maintenance tasks
5. Document any custom modifications

---

## Change Log

### Version 1.0 (2025-10-09)

**Initial deployment includes:**
- 8 tables: profiles, subscriptions, stock_analyses, usage_tracking, watchlist, api_usage, user_preferences, watchlist_alerts
- 3 views: subscription_analytics, usage_analytics, top_analyzed_stocks
- 13 functions: rate limiting, analytics, maintenance
- 30+ indexes: optimized for common queries
- Complete RLS policies: secure user data access
- Automatic triggers: profile creation, usage reset, preferences init

**Features:**
- Multi-tier subscription support (Free, Starter, Pro, Enterprise)
- Granular API usage tracking and rate limiting
- User preferences and customization
- Stock watchlist with price alerts
- Comprehensive analytics for admin dashboard
- Automated maintenance functions
