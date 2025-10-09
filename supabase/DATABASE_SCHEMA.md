# Vortis Database Schema Documentation

## Overview

Comprehensive PostgreSQL/Supabase database schema for the Vortis stock trading intelligence platform. Designed for scalability, security, and performance with Row Level Security (RLS) policies enforced on all tables.

---

## Table of Contents

1. [Core Tables](#core-tables)
2. [Supporting Tables](#supporting-tables)
3. [Views & Materialized Views](#views--materialized-views)
4. [Functions](#functions)
5. [Indexes](#indexes)
6. [RLS Policies](#rls-policies)
7. [Migration Files](#migration-files)

---

## Core Tables

### 1. profiles

Extends Supabase Auth users with additional profile information.

**Columns:**
- `id` (UUID, PK): References auth.users(id)
- `email` (TEXT, UNIQUE): User email address
- `full_name` (TEXT): User's full name
- `avatar_url` (TEXT): Profile picture URL
- `company_name` (TEXT): Company name (for Enterprise users)
- `phone` (TEXT): Contact phone number
- `timezone` (TEXT): User timezone (default: 'UTC')
- `email_verified` (BOOLEAN): Email verification status
- `last_login` (TIMESTAMPTZ): Last login timestamp
- `notifications_enabled` (BOOLEAN): Global notification toggle
- `marketing_emails_enabled` (BOOLEAN): Marketing email consent
- `created_at` (TIMESTAMPTZ): Account creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Relationships:**
- One-to-One with auth.users
- One-to-Many with subscriptions, stock_analyses, watchlist, api_usage
- One-to-One with user_preferences

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile

**Indexes:**
- `idx_profiles_email` on email
- `idx_profiles_last_login` on last_login DESC

---

### 2. subscriptions

Tracks Stripe subscription information and plan details.

**Columns:**
- `id` (UUID, PK): Unique subscription ID
- `user_id` (UUID, FK): References profiles(id)
- `stripe_customer_id` (TEXT, UNIQUE): Stripe customer ID
- `stripe_subscription_id` (TEXT, UNIQUE): Stripe subscription ID
- `stripe_price_id` (TEXT): Stripe price ID
- `plan_name` (TEXT): Plan tier (starter, pro, enterprise)
- `status` (TEXT): Subscription status (active, canceled, trialing, etc.)
- `current_period_start` (TIMESTAMPTZ): Billing period start
- `current_period_end` (TIMESTAMPTZ): Billing period end
- `cancel_at_period_end` (BOOLEAN): Scheduled cancellation flag
- `trial_start` (TIMESTAMPTZ): Trial period start
- `trial_end` (TIMESTAMPTZ): Trial period end
- `metadata` (JSONB): Additional Stripe metadata
- `created_at` (TIMESTAMPTZ): Subscription creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Plan Tiers:**
- **Free**: 5 analyses/month
- **Starter**: 100 analyses/month, $29/mo
- **Pro**: Unlimited analyses, $99/mo
- **Enterprise**: Unlimited + API access, $299/mo

**RLS Policies:**
- Users can view their own subscription

**Indexes:**
- `idx_subscriptions_user_id` on user_id
- `idx_subscriptions_stripe_customer_id` on stripe_customer_id
- `idx_subscriptions_status` on status
- `idx_subscriptions_period_end` on current_period_end
- `idx_subscriptions_user_status` on (user_id, status)

---

### 3. stock_analyses

Stores historical stock analysis results from AI.

**Columns:**
- `id` (UUID, PK): Unique analysis ID
- `user_id` (UUID, FK): References profiles(id) (nullable for free tier)
- `ticker` (TEXT): Stock ticker symbol
- `analysis_type` (TEXT): Analysis depth (free, basic, advanced, enterprise)
- `request_data` (JSONB): Original request parameters
- `response_data` (JSONB): AI analysis response
- `ai_model` (TEXT): AI model used (default: claude-sonnet-4.5)
- `tags` (TEXT[]): User-defined tags
- `sentiment` (TEXT): Analysis sentiment (bullish, bearish, neutral)
- `is_favorite` (BOOLEAN): Favorite flag
- `notes` (TEXT): User notes
- `created_at` (TIMESTAMPTZ): Analysis timestamp

**RLS Policies:**
- Users can view their own analyses (or null user_id for free)
- Users can create analyses
- Users can update their own analyses

**Indexes:**
- `idx_stock_analyses_user_id` on user_id
- `idx_stock_analyses_ticker` on ticker
- `idx_stock_analyses_created_at` on created_at DESC
- `idx_stock_analyses_user_ticker` on (user_id, ticker)
- `idx_stock_analyses_user_favorite` on (user_id, is_favorite) WHERE is_favorite
- `idx_stock_analyses_sentiment` on sentiment WHERE sentiment IS NOT NULL
- `idx_stock_analyses_request_data_gin` GIN index on request_data
- `idx_stock_analyses_response_data_gin` GIN index on response_data

---

### 4. usage_tracking

Tracks monthly API usage per user for rate limiting.

**Columns:**
- `id` (UUID, PK): Unique tracking ID
- `user_id` (UUID, FK): References profiles(id)
- `plan_name` (TEXT): Current plan name
- `analyses_used` (INTEGER): Analyses used in period
- `analyses_limit` (INTEGER): Maximum analyses allowed
- `period_start` (TIMESTAMPTZ): Usage period start
- `period_end` (TIMESTAMPTZ): Usage period end
- `reset_count` (INTEGER): Number of period resets
- `last_reset_at` (TIMESTAMPTZ): Last reset timestamp
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**RLS Policies:**
- Users can view their own usage

**Indexes:**
- `idx_usage_tracking_user_id` on user_id

**Constraints:**
- CHECK: period_end > period_start

---

## Supporting Tables

### 5. watchlist

User-curated list of stocks to monitor.

**Columns:**
- `id` (UUID, PK): Unique watchlist entry ID
- `user_id` (UUID, FK): References profiles(id)
- `ticker` (TEXT): Stock ticker symbol
- `current_price` (NUMERIC(10,2)): Last known price
- `notes` (TEXT): User notes
- `created_at` (TIMESTAMPTZ): Entry creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**RLS Policies:**
- Users can view, insert, update, delete their own watchlist

**Indexes:**
- `idx_watchlist_user_id` on user_id
- `idx_watchlist_ticker` on ticker
- `idx_watchlist_created_at` on created_at DESC

**Constraints:**
- UNIQUE (user_id, ticker): Prevents duplicate tickers per user

---

### 6. api_usage

Granular API request tracking for analytics and rate limiting.

**Columns:**
- `id` (UUID, PK): Unique log ID
- `user_id` (UUID, FK): References profiles(id)
- `endpoint` (TEXT): API endpoint
- `method` (TEXT): HTTP method (GET, POST, PUT, DELETE, PATCH)
- `request_path` (TEXT): Full request path
- `request_params` (JSONB): Request parameters
- `response_status` (INTEGER): HTTP response status code
- `response_time_ms` (INTEGER): Response time in milliseconds
- `ip_address` (INET): Client IP address
- `user_agent` (TEXT): Client user agent
- `api_key_id` (TEXT): API key used (for Enterprise)
- `rate_limit_remaining` (INTEGER): Remaining rate limit
- `cost_credits` (NUMERIC(10,4)): Cost in credits
- `error_message` (TEXT): Error message if failed
- `metadata` (JSONB): Additional metadata
- `created_at` (TIMESTAMPTZ): Request timestamp

**RLS Policies:**
- Users can view their own API usage
- Service role can insert (called from API middleware)

**Indexes:**
- `idx_api_usage_user_id` on user_id
- `idx_api_usage_created_at` on created_at DESC
- `idx_api_usage_endpoint` on endpoint
- `idx_api_usage_response_status` on response_status
- `idx_api_usage_user_date` on (user_id, created_at DESC)
- `idx_api_usage_user_endpoint_date` on (user_id, endpoint, created_at DESC)
- `idx_api_usage_metadata_gin` GIN index on metadata
- `idx_api_usage_errors` on (user_id, created_at DESC) WHERE response_status >= 400

---

### 7. user_preferences

User-specific settings and customization preferences.

**Columns:**
- `id` (UUID, PK): Unique preference ID
- `user_id` (UUID, FK, UNIQUE): References profiles(id)
- `theme` (TEXT): UI theme (light, dark, system)
- `language` (TEXT): Interface language (en, es, fr, de, zh, ja)
- `currency` (TEXT): Preferred currency (USD, EUR, GBP, JPY, CNY)
- `date_format` (TEXT): Date format preference
- `default_chart_type` (TEXT): Chart type (candlestick, line, area, bar)
- `default_time_range` (TEXT): Time range (1D, 1W, 1M, 3M, 6M, 1Y, 5Y, MAX)
- `show_indicators` (BOOLEAN): Show technical indicators
- `preferred_indicators` (TEXT[]): List of preferred indicators
- `risk_tolerance` (TEXT): Risk profile (conservative, moderate, aggressive)
- `analysis_depth` (TEXT): Analysis detail (quick, standard, comprehensive)
- `auto_save_analyses` (BOOLEAN): Auto-save analyses
- `email_alerts` (BOOLEAN): Email notifications enabled
- `push_notifications` (BOOLEAN): Push notifications enabled
- `price_alert_threshold` (NUMERIC(5,2)): Alert threshold percentage
- `daily_digest` (BOOLEAN): Daily digest email
- `weekly_summary` (BOOLEAN): Weekly summary email
- `alert_types` (JSONB): Alert type preferences
- `dashboard_layout` (TEXT): Dashboard layout (grid, list, compact)
- `widgets_config` (JSONB): Widget configuration
- `api_notifications` (BOOLEAN): API usage notifications
- `webhook_url` (TEXT): Webhook URL for alerts
- `advanced_settings` (JSONB): Additional settings
- `created_at` (TIMESTAMPTZ): Preferences creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**RLS Policies:**
- Users can view, insert, update, delete their own preferences

**Indexes:**
- `idx_user_preferences_user_id` on user_id
- `idx_user_preferences_alert_types_gin` GIN index on alert_types
- `idx_user_preferences_widgets_config_gin` GIN index on widgets_config
- `idx_user_preferences_advanced_settings_gin` GIN index on advanced_settings

**Triggers:**
- Auto-initialize default preferences on profile creation

---

### 8. watchlist_alerts

Price alerts and notifications for watchlist stocks.

**Columns:**
- `id` (UUID, PK): Unique alert ID
- `user_id` (UUID, FK): References profiles(id)
- `ticker` (TEXT): Stock ticker symbol
- `alert_type` (TEXT): Alert condition (price_above, price_below, percent_change, volume_spike)
- `target_value` (NUMERIC(10,2)): Target price/percentage
- `is_active` (BOOLEAN): Alert enabled status
- `triggered_at` (TIMESTAMPTZ): When alert was triggered
- `triggered_price` (NUMERIC(10,2)): Price when triggered
- `notification_sent` (BOOLEAN): Notification sent status
- `repeat_alert` (BOOLEAN): Repeat after cooldown
- `cooldown_hours` (INTEGER): Cooldown period hours
- `last_triggered_at` (TIMESTAMPTZ): Last trigger timestamp
- `trigger_count` (INTEGER): Total trigger count
- `notify_email` (BOOLEAN): Send email notification
- `notify_push` (BOOLEAN): Send push notification
- `notify_webhook` (BOOLEAN): Send webhook notification
- `notes` (TEXT): Alert notes
- `metadata` (JSONB): Additional metadata
- `created_at` (TIMESTAMPTZ): Alert creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**RLS Policies:**
- Users can view, insert, update, delete their own alerts

**Indexes:**
- `idx_watchlist_alerts_user_id` on user_id
- `idx_watchlist_alerts_ticker` on ticker
- `idx_watchlist_alerts_active` on is_active WHERE is_active
- `idx_watchlist_alerts_user_ticker` on (user_id, ticker)
- `idx_watchlist_alerts_check` on (is_active, ticker, alert_type) WHERE active and not sent

---

## Views & Materialized Views

### usage_analytics (View)

Real-time view of user usage statistics.

**Columns:**
- `user_id`, `email`, `plan_name`
- `analyses_used`, `analyses_limit`, `usage_percentage`
- `period_start`, `period_end`
- `usage_level` (at_limit, high, medium, low)
- `time_remaining` (interval)

---

### top_analyzed_stocks (View)

Most analyzed stocks in the last 30 days.

**Columns:**
- `ticker`, `analysis_count`, `unique_users`
- `last_analyzed`, `avg_sentiment`, `analysis_types`

---

### subscription_analytics (Materialized View)

Aggregated subscription metrics for admin dashboard.

**Columns:**
- `plan_name`, `status`, `user_count`
- `active_users`, `churning_users`
- `avg_subscription_days`, `first_subscription`, `latest_subscription`

**Refresh:**
- Call `refresh_subscription_analytics()` to update

---

## Functions

### 1. get_api_usage_stats(p_user_id, p_start_date, p_end_date)

Calculate API usage statistics for a user over a date range.

**Returns:**
- total_requests, successful_requests, failed_requests
- avg_response_time_ms, total_cost_credits, top_endpoints

---

### 2. check_rate_limit(p_user_id, p_endpoint, p_window_minutes, p_max_requests)

Check if user has exceeded rate limit for an endpoint.

**Returns:**
- allowed (boolean), current_count, limit_value, reset_at

---

### 3. get_user_preferences(p_user_id)

Retrieve user preferences with fallback to defaults.

**Returns:**
- theme, language, currency, chart settings, all_preferences

---

### 4. check_watchlist_alerts(p_ticker, p_current_price, p_volume)

Check if any alerts should be triggered for a stock.

**Returns:**
- alert_id, user_id, alert_type, should_notify

---

### 5. trigger_alert(p_alert_id, p_triggered_price)

Mark an alert as triggered and update notification status.

---

### 6. get_user_activity_summary(p_user_id)

Comprehensive activity summary for a user.

**Returns:**
- total_analyses, analyses_this_month, favorite_stocks
- avg_analyses_per_day, most_active_day, subscription_plan, account_age_days

---

### 7. cleanup_old_api_logs(p_retention_days)

Remove API logs older than retention period (default 90 days).

**Returns:** Number of deleted rows

---

### 8. reset_monthly_usage()

Reset usage counters for users whose period has ended.

**Returns:** List of reset users with old/new limits

---

### 9. calculate_mrr()

Calculate Monthly Recurring Revenue by plan.

**Returns:**
- plan_name, active_subscriptions, estimated_mrr

---

### 10. get_churn_analytics(p_days)

Calculate churn rate and cancellation patterns.

**Returns:**
- total_cancellations, churn_rate, top_cancellation_plans, avg_subscription_duration_days

---

## Indexes

### Performance Optimizations

All tables have strategic indexes for:
- Foreign key lookups (user_id, etc.)
- Time-series queries (created_at DESC)
- Composite queries (user_id + ticker)
- Partial indexes for common filters
- GIN indexes for JSONB columns

**Total Indexes:** 30+ across all tables

---

## RLS Policies

### Security Model

All tables have Row Level Security enabled with policies enforcing:
- Users can only access their own data
- Service role has elevated permissions for system operations
- No direct access to other users' data

**Policy Pattern:**
```sql
-- SELECT: Users can view their own records
USING (auth.uid() = user_id)

-- INSERT: Users can create their own records
WITH CHECK (auth.uid() = user_id)

-- UPDATE/DELETE: Users can modify their own records
USING (auth.uid() = user_id)
```

---

## Migration Files

### Execution Order

1. **Initial Schema** (`supabase/schema.sql`)
   - Creates core tables: profiles, subscriptions, stock_analyses, usage_tracking
   - Sets up triggers and base RLS policies

2. **002_create_watchlist.sql**
   - Creates watchlist table with RLS

3. **20251009000001_enhance_core_schema.sql**
   - Adds fields to existing tables
   - Creates additional indexes
   - Enhances RLS policies

4. **20251009000002_create_api_usage_table.sql**
   - Creates api_usage table
   - Adds rate limiting functions

5. **20251009000003_create_user_preferences_table.sql**
   - Creates user_preferences table
   - Auto-initializes on profile creation

6. **20251009000004_create_watchlist_alerts_table.sql**
   - Creates watchlist_alerts table
   - Adds alert checking functions

7. **20251009000005_create_admin_views_functions.sql**
   - Creates materialized views
   - Adds admin analytics functions

---

## Usage Examples

### Query User's Active Subscription

```typescript
const { data, error } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single()
```

### Check Usage Limit

```typescript
const { data, error } = await supabase
  .from('usage_tracking')
  .select('*')
  .eq('user_id', userId)
  .gte('period_end', new Date().toISOString())
  .single()

const hasReachedLimit = data.analyses_used >= data.analyses_limit
```

### Get User Preferences

```typescript
const { data, error } = await supabase
  .rpc('get_user_preferences', { p_user_id: userId })

const theme = data[0]?.theme || 'dark'
```

### Check Rate Limit

```typescript
const { data, error } = await supabase
  .rpc('check_rate_limit', {
    p_user_id: userId,
    p_endpoint: '/api/analyze',
    p_window_minutes: 60,
    p_max_requests: 100
  })

if (!data[0]?.allowed) {
  throw new Error('Rate limit exceeded')
}
```

---

## Maintenance

### Regular Tasks

1. **Refresh Materialized Views** (daily)
   ```sql
   SELECT refresh_subscription_analytics();
   ```

2. **Cleanup Old API Logs** (weekly)
   ```sql
   SELECT cleanup_old_api_logs(90);
   ```

3. **Reset Monthly Usage** (monthly via cron)
   ```sql
   SELECT reset_monthly_usage();
   ```

4. **Analyze Query Performance** (as needed)
   ```sql
   EXPLAIN ANALYZE SELECT ...;
   ```

---

## Support

For questions or issues:
- Review migration files in `/supabase/migrations/`
- Check TypeScript types in `/lib/supabase/types.ts`
- Verify RLS policies are enabled on all tables
- Test queries with EXPLAIN ANALYZE for performance
