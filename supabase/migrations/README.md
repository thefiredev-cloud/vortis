# Vortis Database Migrations

This directory contains SQL migration files for the Vortis database schema.

## Migration Execution Order

Execute migrations in the following order:

### 1. Initial Schema
**File:** `../schema.sql` (already applied)
- Creates core tables: profiles, subscriptions, stock_analyses, usage_tracking
- Sets up triggers for auto-profile creation and updated_at
- Establishes base RLS policies
- Creates essential indexes

### 2. Watchlist Table
**File:** `002_create_watchlist.sql` (already applied)
- Creates watchlist table
- Adds RLS policies for watchlist operations
- Creates indexes for user_id, ticker, created_at

### 3. Core Schema Enhancements
**File:** `20251009000001_enhance_core_schema.sql` (NEW)
- Adds trial_start, trial_end, metadata to subscriptions
- Adds company_name, phone, timezone, email_verified, last_login to profiles
- Adds notification preferences to profiles
- Adds tags, sentiment, is_favorite, notes to stock_analyses
- Adds reset_count, last_reset_at to usage_tracking
- Creates additional indexes for performance
- Adds GIN indexes for JSONB columns
- Updates RLS policies

**Apply with:**
```sql
-- Via Supabase SQL Editor or CLI
\i 20251009000001_enhance_core_schema.sql
```

### 4. API Usage Tracking
**File:** `20251009000002_create_api_usage_table.sql` (NEW)
- Creates api_usage table for granular request tracking
- Adds rate limiting functions: check_rate_limit()
- Adds analytics function: get_api_usage_stats()
- Creates optimized indexes for rate limiting queries
- Sets up RLS policies (users can view, service role can insert)

**Features:**
- Track every API request with response time, status, cost
- Rate limiting by endpoint and time window
- IP address and user agent logging
- Error tracking with partial index

**Apply with:**
```sql
\i 20251009000002_create_api_usage_table.sql
```

### 5. User Preferences
**File:** `20251009000003_create_user_preferences_table.sql` (NEW)
- Creates user_preferences table
- Auto-initializes preferences on profile creation (trigger)
- Adds helper function: get_user_preferences()
- Stores UI, chart, notification, and dashboard preferences
- Creates GIN indexes for JSONB fields

**Features:**
- Theme, language, currency preferences
- Chart and indicator settings
- Risk tolerance and analysis depth
- Email/push notification settings
- Dashboard layout and widget config
- Webhook URL for Enterprise users

**Apply with:**
```sql
\i 20251009000003_create_user_preferences_table.sql
```

### 6. Watchlist Alerts
**File:** `20251009000004_create_watchlist_alerts_table.sql` (NEW)
- Creates watchlist_alerts table
- Adds alert checking function: check_watchlist_alerts()
- Adds trigger function: trigger_alert()
- Supports price alerts, volume spikes, percent changes
- Implements cooldown periods and repeat alerts

**Features:**
- Price above/below alerts
- Percent change alerts
- Volume spike alerts
- Email, push, webhook notifications
- Repeat alerts with cooldown
- Trigger history tracking

**Apply with:**
```sql
\i 20251009000004_create_watchlist_alerts_table.sql
```

### 7. Admin Views & Functions
**File:** `20251009000005_create_admin_views_functions.sql` (NEW)
- Creates subscription_analytics materialized view
- Creates usage_analytics and top_analyzed_stocks views
- Adds analytics functions: calculate_mrr(), get_churn_analytics()
- Adds maintenance functions: cleanup_old_api_logs(), reset_monthly_usage()
- Adds user summary function: get_user_activity_summary()

**Features:**
- Real-time subscription metrics
- MRR (Monthly Recurring Revenue) calculation
- Churn rate analysis
- Top analyzed stocks tracking
- User activity summaries
- Automated cleanup utilities

**Apply with:**
```sql
\i 20251009000005_create_admin_views_functions.sql
```

---

## Applying Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase db push --file 20251009000001_enhance_core_schema.sql
```

### Option 2: SQL Editor (Supabase Dashboard)

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of migration file
3. Paste and execute
4. Verify no errors in output
5. Check that tables/functions were created

### Option 3: Direct SQL Execution

```bash
# Using psql
psql $DATABASE_URL -f supabase/migrations/20251009000001_enhance_core_schema.sql

# Using Supabase CLI
supabase db execute --file supabase/migrations/20251009000001_enhance_core_schema.sql
```

---

## Verification Steps

After applying each migration, verify it was successful:

### Check Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- api_usage
- profiles
- stock_analyses
- subscriptions
- usage_tracking
- user_preferences
- watchlist
- watchlist_alerts

### Check Functions Exist

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Expected functions:
- check_rate_limit
- check_watchlist_alerts
- cleanup_old_api_logs
- calculate_mrr
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

### Check Views Exist

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type IN ('VIEW', 'MATERIALIZED VIEW')
ORDER BY table_name;
```

Expected views:
- subscription_analytics (MATERIALIZED VIEW)
- top_analyzed_stocks (VIEW)
- usage_analytics (VIEW)

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should have rowsecurity = true.

### Check Indexes

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Should see 30+ indexes across all tables.

---

## Rollback Instructions

If you need to rollback a migration:

### Rollback Migration 5 (Admin Views)
```sql
DROP MATERIALIZED VIEW IF EXISTS subscription_analytics;
DROP VIEW IF EXISTS usage_analytics;
DROP VIEW IF EXISTS top_analyzed_stocks;
DROP FUNCTION IF EXISTS refresh_subscription_analytics();
DROP FUNCTION IF EXISTS get_user_activity_summary(UUID);
DROP FUNCTION IF EXISTS cleanup_old_api_logs(INTEGER);
DROP FUNCTION IF EXISTS reset_monthly_usage();
DROP FUNCTION IF EXISTS calculate_mrr();
DROP FUNCTION IF EXISTS get_churn_analytics(INTEGER);
```

### Rollback Migration 4 (Watchlist Alerts)
```sql
DROP TABLE IF EXISTS watchlist_alerts CASCADE;
DROP FUNCTION IF EXISTS check_watchlist_alerts(TEXT, NUMERIC, BIGINT);
DROP FUNCTION IF EXISTS trigger_alert(UUID, NUMERIC);
```

### Rollback Migration 3 (User Preferences)
```sql
DROP TRIGGER IF EXISTS on_profile_created_init_preferences ON profiles;
DROP FUNCTION IF EXISTS initialize_user_preferences();
DROP FUNCTION IF EXISTS get_user_preferences(UUID);
DROP TABLE IF EXISTS user_preferences CASCADE;
```

### Rollback Migration 2 (API Usage)
```sql
DROP TABLE IF EXISTS api_usage CASCADE;
DROP FUNCTION IF EXISTS get_api_usage_stats(UUID, TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS check_rate_limit(UUID, TEXT, INTEGER, INTEGER);
```

### Rollback Migration 1 (Enhancements)
```sql
-- Remove new columns from existing tables
ALTER TABLE subscriptions DROP COLUMN IF EXISTS trial_start;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS trial_end;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS metadata;

ALTER TABLE profiles DROP COLUMN IF EXISTS company_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE profiles DROP COLUMN IF EXISTS timezone;
ALTER TABLE profiles DROP COLUMN IF EXISTS email_verified;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_login;
ALTER TABLE profiles DROP COLUMN IF EXISTS notifications_enabled;
ALTER TABLE profiles DROP COLUMN IF EXISTS marketing_emails_enabled;

ALTER TABLE stock_analyses DROP COLUMN IF EXISTS tags;
ALTER TABLE stock_analyses DROP COLUMN IF EXISTS sentiment;
ALTER TABLE stock_analyses DROP COLUMN IF EXISTS is_favorite;
ALTER TABLE stock_analyses DROP COLUMN IF EXISTS notes;

ALTER TABLE usage_tracking DROP COLUMN IF EXISTS reset_count;
ALTER TABLE usage_tracking DROP COLUMN IF EXISTS last_reset_at;

-- Drop new indexes
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_last_login;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_period_end;
DROP INDEX IF EXISTS idx_subscriptions_user_status;
DROP INDEX IF EXISTS idx_stock_analyses_user_ticker;
DROP INDEX IF EXISTS idx_stock_analyses_user_favorite;
DROP INDEX IF EXISTS idx_stock_analyses_sentiment;
DROP INDEX IF EXISTS idx_stock_analyses_request_data_gin;
DROP INDEX IF EXISTS idx_stock_analyses_response_data_gin;
```

---

## Testing Migrations

Before applying to production, test on a staging environment:

1. Create a test Supabase project
2. Apply migrations sequentially
3. Run verification queries
4. Test application functionality
5. Verify RLS policies work as expected
6. Check query performance with EXPLAIN ANALYZE

---

## Common Issues

### Issue: "relation already exists"
**Solution:** Migration was already applied. Check if table/function exists before running.

### Issue: "permission denied for schema public"
**Solution:** Ensure you're using a user with proper permissions. Use service role key if needed.

### Issue: "RLS policy prevents access"
**Solution:** Verify auth.uid() is set. For testing, temporarily disable RLS or use service role.

### Issue: "duplicate key value violates unique constraint"
**Solution:** Check for existing data that conflicts with new constraints. May need to clean up data first.

### Issue: "function does not exist"
**Solution:** Ensure previous migrations were applied successfully. Check dependencies.

---

## Maintenance Schedule

### Daily
- No action required (automatic triggers handle most operations)

### Weekly
- Clean up old API logs (> 90 days)
  ```sql
  SELECT cleanup_old_api_logs(90);
  ```

### Monthly
- Refresh subscription analytics
  ```sql
  SELECT refresh_subscription_analytics();
  ```
- Reset monthly usage (automatic via cron or manual)
  ```sql
  SELECT reset_monthly_usage();
  ```

### Quarterly
- Review and optimize slow queries
- Analyze table statistics
  ```sql
  ANALYZE;
  ```
- Vacuum dead tuples
  ```sql
  VACUUM ANALYZE;
  ```

---

## Support

For migration issues:
1. Check Supabase logs in Dashboard
2. Review error messages carefully
3. Verify previous migrations were applied
4. Test on staging environment first
5. Consult DATABASE_SCHEMA.md for table details
6. Check QUERY_EXAMPLES.md for usage patterns

**Documentation:**
- Database Schema: ../DATABASE_SCHEMA.md
- Schema Diagram: ../SCHEMA_DIAGRAM.md
- Query Examples: ../QUERY_EXAMPLES.md
- TypeScript Types: ../../lib/supabase/types.ts
