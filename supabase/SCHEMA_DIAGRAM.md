# Vortis Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION                                  │
└─────────────────────────────────────────────────────────────────────────────┘

                              auth.users (Supabase Auth)
                                      │
                                      │ 1:1
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               CORE TABLES                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   profiles   │ ◄────────────────┐
                              │              │                   │
                              │ - id (PK)    │                   │
                              │ - email      │                   │
                              │ - full_name  │                   │
                              │ - company    │                   │
                              │ - phone      │                   │
                              └──────┬───────┘                   │
                                     │                           │
                                     │ 1:N                       │ 1:1
                    ┌────────────────┼────────────────┐          │
                    │                │                │          │
                    ▼                ▼                ▼          │
          ┌─────────────────┐ ┌─────────────┐ ┌──────────────────────┐
          │  subscriptions  │ │  watchlist  │ │ user_preferences     │
          │                 │ │             │ │                      │
          │ - id (PK)       │ │ - id (PK)   │ │ - id (PK)            │
          │ - user_id (FK)  │ │ - user_id   │ │ - user_id (FK,UNIQ) ─┘
          │ - stripe_cust   │ │ - ticker    │ │ - theme              │
          │ - plan_name     │ │ - price     │ │ - language           │
          │ - status        │ │ - notes     │ │ - currency           │
          │ - period_start  │ └─────────────┘ │ - chart_settings     │
          │ - period_end    │                 │ - alert_settings     │
          └─────────────────┘                 │ - dashboard_config   │
                                              └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          ANALYSIS & TRACKING                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   profiles   │
                              └──────┬───────┘
                                     │
                                     │ 1:N
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
          ┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
          │ stock_analyses  │ │ api_usage    │ │ usage_tracking  │
          │                 │ │              │ │                 │
          │ - id (PK)       │ │ - id (PK)    │ │ - id (PK)       │
          │ - user_id (FK)  │ │ - user_id    │ │ - user_id (FK)  │
          │ - ticker        │ │ - endpoint   │ │ - plan_name     │
          │ - analysis_type │ │ - method     │ │ - analyses_used │
          │ - request_data  │ │ - status     │ │ - analyses_limit│
          │ - response_data │ │ - duration   │ │ - period_start  │
          │ - sentiment     │ │ - ip_address │ │ - period_end    │
          │ - is_favorite   │ │ - cost       │ │ - reset_count   │
          │ - tags[]        │ └──────────────┘ └─────────────────┘
          │ - notes         │
          └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          ALERTS & NOTIFICATIONS                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   profiles   │
                              └──────┬───────┘
                                     │
                                     │ 1:N
                                     ▼
                          ┌──────────────────────┐
                          │  watchlist_alerts    │
                          │                      │
                          │ - id (PK)            │
                          │ - user_id (FK)       │
                          │ - ticker             │
                          │ - alert_type         │
                          │ - target_value       │
                          │ - is_active          │
                          │ - triggered_at       │
                          │ - repeat_alert       │
                          │ - cooldown_hours     │
                          │ - notify_email       │
                          │ - notify_push        │
                          │ - notify_webhook     │
                          └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          VIEWS & ANALYTICS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐        ┌──────────────────────┐
    │  usage_analytics    │        │ top_analyzed_stocks  │
    │  (View)             │        │ (View)               │
    │                     │        │                      │
    │ Real-time usage     │        │ Most popular stocks  │
    │ statistics per user │        │ Last 30 days         │
    └─────────────────────┘        └──────────────────────┘

    ┌──────────────────────────────────────────┐
    │    subscription_analytics                │
    │    (Materialized View)                   │
    │                                          │
    │    Aggregated subscription metrics       │
    │    Refresh: Call refresh_subscription... │
    └──────────────────────────────────────────┘
```

---

## Table Relationships

### Primary Relationships

| Parent Table | Child Table | Relationship | Constraint |
|--------------|-------------|--------------|------------|
| auth.users | profiles | 1:1 | ON DELETE CASCADE |
| profiles | subscriptions | 1:N | ON DELETE CASCADE |
| profiles | stock_analyses | 1:N | ON DELETE CASCADE |
| profiles | watchlist | 1:N | ON DELETE CASCADE |
| profiles | api_usage | 1:N | ON DELETE CASCADE |
| profiles | usage_tracking | 1:N | ON DELETE CASCADE |
| profiles | user_preferences | 1:1 | ON DELETE CASCADE |
| profiles | watchlist_alerts | 1:N | ON DELETE CASCADE |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER REGISTRATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

    1. User Signs Up
           │
           ▼
    2. Supabase Auth creates auth.users
           │
           ▼
    3. Trigger: on_auth_user_created
           │
           ▼
    4. Create profiles record
           │
           ▼
    5. Trigger: on_profile_created_init_preferences
           │
           ▼
    6. Create user_preferences with defaults


┌─────────────────────────────────────────────────────────────────────────┐
│                        SUBSCRIPTION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

    1. User selects plan
           │
           ▼
    2. Stripe checkout session created
           │
           ▼
    3. Payment successful
           │
           ▼
    4. Webhook: Create/Update subscriptions
           │
           ▼
    5. Create usage_tracking record
           │
           ▼
    6. User can access plan features


┌─────────────────────────────────────────────────────────────────────────┐
│                         ANALYSIS FLOW                                    │
└─────────────────────────────────────────────────────────────────────────┘

    1. User requests stock analysis
           │
           ▼
    2. Check usage_tracking.analyses_used < analyses_limit
           │
           ├─ No  ─► Return 429 Rate Limit
           │
           ▼ Yes
    3. Check API rate limit (check_rate_limit)
           │
           ▼
    4. Call AI API (Claude Sonnet 4.5)
           │
           ▼
    5. Save to stock_analyses
           │
           ▼
    6. Increment usage_tracking.analyses_used
           │
           ▼
    7. Log to api_usage
           │
           ▼
    8. Return analysis to user


┌─────────────────────────────────────────────────────────────────────────┐
│                          ALERT FLOW                                      │
└─────────────────────────────────────────────────────────────────────────┘

    1. User adds stock to watchlist
           │
           ▼
    2. User creates watchlist_alert
           │
           ▼
    3. Background job: Fetch current prices
           │
           ▼
    4. Call check_watchlist_alerts(ticker, price)
           │
           ├─ Alert triggered ─► Send notification
           │                    │
           │                    ▼
           │                    Call trigger_alert()
           │                    │
           │                    ▼
           │                    Update triggered_at, notification_sent
           │
           ▼
    5. Update watchlist.current_price
```

---

## Index Strategy

### High-Performance Query Patterns

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         QUERY OPTIMIZATION                               │
└─────────────────────────────────────────────────────────────────────────┘

1. USER DASHBOARD (Most Common)
   ─────────────────────────────
   Query: Get user's subscription, usage, recent analyses
   Indexes Used:
   - idx_subscriptions_user_status (user_id, status)
   - idx_usage_tracking_user_id (user_id)
   - idx_stock_analyses_user_id (user_id)

2. STOCK SEARCH
   ─────────────
   Query: Find all analyses for a ticker
   Indexes Used:
   - idx_stock_analyses_ticker (ticker)
   - idx_stock_analyses_user_ticker (user_id, ticker)

3. RATE LIMITING
   ──────────────
   Query: Count requests in last N minutes
   Indexes Used:
   - idx_api_usage_user_endpoint_date (user_id, endpoint, created_at DESC)

4. ADMIN ANALYTICS
   ────────────────
   Query: Subscription metrics, churn analysis
   Views Used:
   - subscription_analytics (Materialized)
   - usage_analytics (Real-time)

5. ALERT CHECKING
   ───────────────
   Query: Find active alerts for ticker
   Indexes Used:
   - idx_watchlist_alerts_check (is_active, ticker, alert_type)
```

---

## Security Model (RLS)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ROW LEVEL SECURITY POLICIES                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  PUBLIC SCHEMA       │
│  (All tables RLS ON) │
└──────────────────────┘
         │
         ├─ profiles
         │  └─ Policy: auth.uid() = id
         │
         ├─ subscriptions
         │  └─ Policy: auth.uid() = user_id
         │
         ├─ stock_analyses
         │  └─ Policy: auth.uid() = user_id OR user_id IS NULL (free tier)
         │
         ├─ watchlist
         │  └─ Policy: auth.uid() = user_id
         │
         ├─ api_usage
         │  ├─ SELECT: auth.uid() = user_id
         │  └─ INSERT: Service role only
         │
         ├─ usage_tracking
         │  └─ Policy: auth.uid() = user_id
         │
         ├─ user_preferences
         │  └─ Policy: auth.uid() = user_id
         │
         └─ watchlist_alerts
            └─ Policy: auth.uid() = user_id

┌──────────────────────────────────────────────┐
│  BYPASS RLS                                  │
│  - Service role (for system operations)      │
│  - Database functions (SECURITY DEFINER)     │
└──────────────────────────────────────────────┘
```

---

## Function Call Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AVAILABLE FUNCTIONS                              │
└─────────────────────────────────────────────────────────────────────────┘

USER OPERATIONS
├─ get_user_preferences(user_id)
├─ get_user_activity_summary(user_id)
└─ get_api_usage_stats(user_id, start_date, end_date)

RATE LIMITING
└─ check_rate_limit(user_id, endpoint, window_minutes, max_requests)

ALERTS
├─ check_watchlist_alerts(ticker, current_price, volume)
└─ trigger_alert(alert_id, triggered_price)

ADMIN / CRON
├─ reset_monthly_usage()
├─ cleanup_old_api_logs(retention_days)
├─ calculate_mrr()
├─ get_churn_analytics(days)
└─ refresh_subscription_analytics()

TRIGGERS (Automatic)
├─ on_auth_user_created → handle_new_user()
├─ on_profile_created → initialize_user_preferences()
├─ update_profiles_updated_at
├─ update_subscriptions_updated_at
├─ update_usage_tracking_updated_at
├─ update_watchlist_updated_at
├─ update_user_preferences_updated_at
└─ update_watchlist_alerts_updated_at
```

---

## Storage Estimates

### Table Size Projections (1 year, 10,000 users)

| Table | Avg Row Size | Est. Rows | Est. Size | Notes |
|-------|--------------|-----------|-----------|-------|
| profiles | 500 bytes | 10,000 | 5 MB | One per user |
| subscriptions | 300 bytes | 10,000 | 3 MB | One per user |
| stock_analyses | 5 KB | 500,000 | 2.5 GB | 50 analyses/user/year |
| usage_tracking | 200 bytes | 120,000 | 24 MB | 12 records/user/year |
| watchlist | 200 bytes | 50,000 | 10 MB | 5 stocks/user avg |
| api_usage | 1 KB | 5,000,000 | 5 GB | 500 requests/user/year |
| user_preferences | 2 KB | 10,000 | 20 MB | One per user |
| watchlist_alerts | 500 bytes | 20,000 | 10 MB | 2 alerts/user avg |

**Total Estimated Storage (1 year):** ~7.6 GB

**With 100,000 users:** ~76 GB
**With 1,000,000 users:** ~760 GB

---

## Performance Considerations

### Query Performance Targets

- Simple queries (by PK/FK): < 5ms
- Dashboard queries: < 50ms
- Analytics queries: < 200ms
- Materialized view refresh: < 5s

### Optimization Strategies

1. **Indexes**: 30+ strategic indexes on hot paths
2. **Partitioning**: Consider partitioning api_usage by month if > 100M rows
3. **Materialized Views**: Pre-compute expensive aggregations
4. **JSONB GIN Indexes**: Fast queries on JSON fields
5. **Partial Indexes**: Reduce index size for filtered queries

---

## Backup & Recovery

### Backup Strategy

- **Supabase Automatic Backups**: Daily (Pro plan)
- **Point-in-Time Recovery**: 7-30 days retention
- **Manual Exports**: Weekly via pg_dump for critical data

### Critical Tables (Priority Backup)

1. profiles (user accounts)
2. subscriptions (billing data)
3. stock_analyses (user-generated content)
4. user_preferences (customization)

### Archival Strategy

- Archive api_usage > 90 days (call cleanup_old_api_logs)
- Archive stock_analyses > 1 year (move to cold storage)
- Keep subscriptions indefinitely (audit trail)
