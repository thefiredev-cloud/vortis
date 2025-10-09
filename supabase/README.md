# Vortis Supabase Database

Complete PostgreSQL/Supabase database schema for the Vortis stock trading intelligence platform.

## Quick Links

- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete schema documentation
- **[SCHEMA_DIAGRAM.md](./SCHEMA_DIAGRAM.md)** - Visual entity relationships and diagrams
- **[QUERY_EXAMPLES.md](./QUERY_EXAMPLES.md)** - TypeScript query patterns and examples
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[migrations/README.md](./migrations/README.md)** - Migration execution guide

## Database Overview

### Tables (8)

1. **profiles** - User accounts and profile information
2. **subscriptions** - Stripe subscription tracking
3. **stock_analyses** - Saved stock analysis results from AI
4. **usage_tracking** - Monthly usage limits per user
5. **watchlist** - User stock watchlists
6. **api_usage** - Granular API request tracking
7. **user_preferences** - User settings and customization
8. **watchlist_alerts** - Price alerts and notifications

### Views (3)

1. **subscription_analytics** (Materialized) - Aggregated subscription metrics
2. **usage_analytics** (View) - Real-time usage statistics
3. **top_analyzed_stocks** (View) - Most analyzed stocks (last 30 days)

### Functions (13)

- Rate limiting: `check_rate_limit()`
- Analytics: `get_api_usage_stats()`, `calculate_mrr()`, `get_churn_analytics()`
- Alerts: `check_watchlist_alerts()`, `trigger_alert()`
- Maintenance: `cleanup_old_api_logs()`, `reset_monthly_usage()`
- User operations: `get_user_preferences()`, `get_user_activity_summary()`

## Quick Start

```bash
# Apply all migrations
supabase link --project-ref your-project-ref
supabase db push

# Verify deployment
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
```

## Features

✅ **Multi-tier subscriptions** - Free (5/mo), Starter (100/mo), Pro (unlimited), Enterprise (unlimited + API)
✅ **Row Level Security** - All tables protected with RLS policies
✅ **Rate limiting** - Granular API usage tracking and limits
✅ **Price alerts** - Watchlist notifications for price changes
✅ **User preferences** - Customizable UI, charts, notifications
✅ **Admin analytics** - MRR, churn, usage tracking
✅ **Optimized indexes** - 30+ strategic indexes for performance
✅ **Automatic triggers** - Profile creation, usage reset, preference init
✅ **JSONB support** - Flexible data storage with GIN indexes
✅ **Comprehensive documentation** - 70+ pages of docs and examples

## Plan Limits

| Plan | Analyses/Month | Price | Features |
|------|----------------|-------|----------|
| Free | 5 | $0 | Basic analysis, Limited history |
| Starter | 100 | $29 | Standard analysis, Watchlists, 30-day history |
| Pro | Unlimited | $99 | Advanced analysis, Full history, Priority support |
| Enterprise | Unlimited | $299 | API access, Custom integrations, SLA |

## Schema Relationships

```
auth.users (Supabase)
    ↓
profiles (1:1)
    ├─ subscriptions (1:N)
    ├─ stock_analyses (1:N)
    ├─ watchlist (1:N)
    ├─ watchlist_alerts (1:N)
    ├─ api_usage (1:N)
    ├─ usage_tracking (1:N)
    └─ user_preferences (1:1)
```

## TypeScript Types

Complete TypeScript types available in:
- `../lib/supabase/types.ts`

```typescript
import type { Profile, Subscription, StockAnalysis } from '@/lib/supabase/types'

// All tables have Row, Insert, Update types
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
```

## Migration Files

Located in `./migrations/`:

1. `20251009000001_enhance_core_schema.sql` - Add fields to existing tables
2. `20251009000002_create_api_usage_table.sql` - API tracking and rate limiting
3. `20251009000003_create_user_preferences_table.sql` - User settings
4. `20251009000004_create_watchlist_alerts_table.sql` - Price alerts
5. `20251009000005_create_admin_views_functions.sql` - Analytics and maintenance

## Security

- ✅ Row Level Security enabled on all tables
- ✅ Users can only access their own data
- ✅ Service role required for admin operations
- ✅ SECURITY DEFINER functions for safe operations
- ✅ Unique constraints prevent duplicates
- ✅ Foreign keys enforce referential integrity

## Performance

- **Indexes:** 30+ strategic indexes for hot paths
- **GIN indexes:** Fast JSONB queries
- **Partial indexes:** Reduce size for filtered queries
- **Materialized views:** Pre-computed aggregations
- **Query targets:** < 5ms simple queries, < 50ms dashboard queries

## Maintenance

### Automated (via Cron)
- Daily: Automatic backups (Supabase)
- Weekly: Cleanup old API logs (90 days)
- Monthly: Reset usage counters, refresh analytics

### Manual (Quarterly)
- Optimize slow queries
- Analyze table statistics
- Review RLS policies

## Support

For issues or questions:
1. Check DEPLOYMENT_GUIDE.md for troubleshooting
2. Review QUERY_EXAMPLES.md for usage patterns
3. Consult DATABASE_SCHEMA.md for detailed table info
4. Check Supabase logs in Dashboard

## Version

**Current Version:** 1.0  
**Last Updated:** 2025-10-09  
**PostgreSQL:** 16+  
**Supabase:** Compatible with all plans

---

**Documentation:** 70+ pages  
**Tables:** 8 tables + 3 views  
**Functions:** 13 utility functions  
**Indexes:** 30+ optimized indexes  
**RLS Policies:** Complete coverage  
**TypeScript:** Fully typed  
