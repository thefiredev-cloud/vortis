# Vortis Database Migration Status Report

**Date**: October 9, 2025
**Project**: Vortis
**Supabase Project ID**: `bgywvwxqrijncqgdwsle`
**Region**: West US (North California)

---

## Executive Summary

The Vortis Supabase project has been identified and linked successfully. However, migrations need to be applied manually via the Supabase Dashboard SQL Editor due to CLI connectivity issues.

---

## Connection Details

### Project Information
- **Project Name**: Vortis
- **Project Reference ID**: `bgywvwxqrijncqgdwsle`
- **Region**: West US (North California)
- **API URL**: `https://bgywvwxqrijncqgdwsle.supabase.co`

### API Keys

**Anon Key** (for client-side use):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneXd2d3hxcmlqbmNxZ2R3c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzAwOTcsImV4cCI6MjA3NDc0NjA5N30.rHVYlU-H83oR9l1ryju7pKq7JiyA_fBv_MDZFJR6_mk
```

**Service Role Key** (for server-side use - keep secret):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneXd2d3hxcmlqbmNxZ2R3c2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE3MDA5NywiZXhwIjoyMDc0NzQ2MDk3fQ.Q9Asze6QMlrZAnc3_T-ge7_rnoiNGHBZ7LOd6e_9SYo
```

---

## Environment Configuration

Update your `.env.local` file with these values:

```bash
# =====================================================
# SUPABASE CONFIGURATION
# =====================================================

NEXT_PUBLIC_SUPABASE_URL=https://bgywvwxqrijncqgdwsle.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneXd2d3hxcmlqbmNxZ2R3c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzAwOTcsImV4cCI6MjA3NDc0NjA5N30.rHVYlU-H83oR9l1ryju7pKq7JiyA_fBv_MDZFJR6_mk

# Service role (server-side only - NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneXd2d3hxcmlqbmNxZ2R3c2xlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE3MDA5NywiZXhwIjoyMDc0NzQ2MDk3fQ.Q9Asze6QMlrZAnc3_T-ge7_rnoiNGHBZ7LOd6e_9SYo
```

---

## Migration Status

### Migrations to Apply

The following migrations need to be applied **in order** via the Supabase Dashboard SQL Editor:

| # | Migration File | Status | Description |
|---|----------------|--------|-------------|
| 1 | `002_create_watchlist.sql` | ⚠️ **Needs Manual Application** | Create watchlist table with RLS |
| 2 | `20251009000001_enhance_core_schema.sql` | ⚠️ **Needs Manual Application** | Add columns to existing tables, create indexes |
| 3 | `20251009000002_create_api_usage_table.sql` | ⚠️ **Needs Manual Application** | API usage tracking and rate limiting |
| 4 | `20251009000003_create_user_preferences_table.sql` | ⚠️ **Needs Manual Application** | User preferences and settings |
| 5 | `20251009000004_create_watchlist_alerts_table.sql` | ⚠️ **Needs Manual Application** | Price alerts for watchlist |
| 6 | `20251009000005_create_admin_views_functions.sql` | ⚠️ **Needs Manual Application** | Admin analytics views and functions |

---

## Manual Application Instructions

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project **Vortis** (`bgywvwxqrijncqgdwsle`)
3. Navigate to **SQL Editor** from the left sidebar

### Step 2: Apply Base Extensions

Run this first to enable required PostgreSQL extensions:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

### Step 3: Apply Migration 002 - Watchlist

Copy the contents of `/supabase/migrations/002_create_watchlist.sql` and execute in SQL Editor.

**Expected Result**:
- `watchlist` table created
- 4 RLS policies created
- 3 indexes created

### Step 4: Apply Migration 20251009000001 - Core Schema Enhancements

Copy the contents of `/supabase/migrations/20251009000001_enhance_core_schema.sql` and execute.

**Expected Result**:
- New columns added to `profiles`, `subscriptions`, `stock_analyses`, `usage_tracking`
- Multiple indexes created
- Comments added to tables

### Step 5: Apply Migration 20251009000002 - API Usage Tracking

Copy the contents of `/supabase/migrations/20251009000002_create_api_usage_table.sql` and execute.

**Expected Result**:
- `api_usage` table created
- Functions: `get_api_usage_stats`, `check_rate_limit`
- Multiple indexes including GIN indexes for JSONB

### Step 6: Apply Migration 20251009000003 - User Preferences

Copy the contents of `/supabase/migrations/20251009000003_create_user_preferences_table.sql` and execute.

**Expected Result**:
- `user_preferences` table created
- Function: `initialize_user_preferences`, `get_user_preferences`
- Trigger to auto-create preferences on profile creation

### Step 7: Apply Migration 20251009000004 - Watchlist Alerts

Copy the contents of `/supabase/migrations/20251009000004_create_watchlist_alerts_table.sql` and execute.

**Expected Result**:
- `watchlist_alerts` table created
- Functions: `check_watchlist_alerts`, `trigger_alert`
- Indexes for alert checking

### Step 8: Apply Migration 20251009000005 - Admin Views

Copy the contents of `/supabase/migrations/20251009000005_create_admin_views_functions.sql` and execute.

**Expected Result**:
- Materialized view: `subscription_analytics`
- Views: `usage_analytics`, `top_analyzed_stocks`
- Functions: `get_user_activity_summary`, `cleanup_old_api_logs`, `reset_monthly_usage`, `calculate_mrr`, `get_churn_analytics`

---

## Verification Steps

After applying all migrations, run these queries in the SQL Editor to verify:

### 1. Check All Tables Created

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'subscriptions',
    'stock_analyses',
    'usage_tracking',
    'watchlist',
    'api_usage',
    'user_preferences',
    'watchlist_alerts'
  )
ORDER BY table_name;
```

**Expected**: 8 tables

### 2. Check All Functions Created

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'check_rate_limit',
    'check_watchlist_alerts',
    'cleanup_old_api_logs',
    'calculate_mrr',
    'get_api_usage_stats',
    'get_churn_analytics',
    'get_user_activity_summary',
    'get_user_preferences',
    'initialize_user_preferences',
    'refresh_subscription_analytics',
    'reset_monthly_usage',
    'trigger_alert',
    'update_updated_at_column',
    'handle_new_user'
  )
ORDER BY routine_name;
```

**Expected**: 13-14 functions

### 3. Check All Views Created

```sql
SELECT table_name, table_type
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'usage_analytics',
    'top_analyzed_stocks'
  )
ORDER BY table_name;

-- Check materialized view separately
SELECT matviewname
FROM pg_matviews
WHERE schemaname = 'public';
```

**Expected**: 2 views + 1 materialized view

### 4. Check RLS Policies

```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected**: Each table should have 3-4 policies

### 5. Check Indexes

```sql
SELECT
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected**: 30+ indexes total

---

## Schema Overview

### Tables Created (8)

1. **profiles** - User profiles extending Supabase Auth
2. **subscriptions** - Stripe subscription tracking
3. **stock_analyses** - Historical analysis results
4. **usage_tracking** - Monthly usage limits
5. **watchlist** - User stock watchlists
6. **api_usage** - Granular API request tracking
7. **user_preferences** - User settings and preferences
8. **watchlist_alerts** - Price alerts for stocks

### Views Created (3)

1. **subscription_analytics** (materialized) - Subscription metrics
2. **usage_analytics** - Real-time usage statistics
3. **top_analyzed_stocks** - Most analyzed stocks

### Functions Created (13+)

- Rate limiting: `check_rate_limit`
- Alert management: `check_watchlist_alerts`, `trigger_alert`
- Analytics: `get_user_activity_summary`, `get_api_usage_stats`, `calculate_mrr`, `get_churn_analytics`
- Maintenance: `cleanup_old_api_logs`, `reset_monthly_usage`, `refresh_subscription_analytics`
- User management: `initialize_user_preferences`, `get_user_preferences`, `handle_new_user`
- Triggers: `update_updated_at_column`

---

## Troubleshooting

### Issue: "relation already exists"

**Solution**: Migration already applied. Skip to next migration or use `CREATE TABLE IF NOT EXISTS`.

### Issue: "duplicate key value violates unique constraint"

**Solution**: Some data already exists. Check for duplicates before applying constraint.

### Issue: "permission denied for table"

**Solution**:
1. Check RLS is enabled on the table
2. Verify policies exist and are correct
3. Test with service role key (bypasses RLS)

### Issue: "function does not exist"

**Solution**: Migration not applied. Re-run the migration containing that function.

---

## CLI Connectivity Issues

The Supabase CLI is experiencing connection issues:

```
Error: failed to connect to `host=aws-1-us-west-1.pooler.supabase.com`
Error: unexpected unban status 400: {"message":"ipv4_addresses: Expected array, received null"}
```

**Recommended Actions**:
1. Use Supabase Dashboard SQL Editor for now (instructions above)
2. Update Supabase CLI: `npm install -g supabase@latest`
3. Check Supabase project is not paused
4. Verify network connectivity and firewall settings

---

## Next Steps

1. ✅ **Apply Migrations**: Follow Step-by-Step instructions above
2. ✅ **Update .env.local**: Add Supabase URL and keys
3. ✅ **Run Verification**: Execute verification queries
4. ✅ **Test Application**: Run `npm run dev` and test features
5. ✅ **Monitor Performance**: Check Supabase Dashboard for errors

---

## Support Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/bgywvwxqrijncqgdwsle
- **Migration Files**: `/Users/tannerosterkamp/vortis/supabase/migrations/`
- **Documentation**: `/Users/tannerosterkamp/vortis/supabase/README.md`
- **Deployment Guide**: `/Users/tannerosterkamp/vortis/supabase/DEPLOYMENT_GUIDE.md`

---

## Summary

**Project Status**: ⚠️ **Migrations Pending**

**Action Required**: Apply 6 migrations manually via Supabase Dashboard SQL Editor

**Connection Details**: ✅ **Provided** (URL + API keys ready for .env.local)

**Estimated Time**: 15-20 minutes to apply all migrations manually

---

**Generated**: October 9, 2025
**Report By**: Claude Code Agent
**Project**: Vortis Stock Analysis Platform
