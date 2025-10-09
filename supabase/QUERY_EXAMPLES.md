# Vortis Database Query Examples

Common query patterns and TypeScript examples for the Vortis platform.

---

## Table of Contents

1. [User Management](#user-management)
2. [Subscription Queries](#subscription-queries)
3. [Stock Analysis](#stock-analysis)
4. [Watchlist Operations](#watchlist-operations)
5. [Usage Tracking](#usage-tracking)
6. [API Usage & Rate Limiting](#api-usage--rate-limiting)
7. [User Preferences](#user-preferences)
8. [Alerts](#alerts)
9. [Admin Analytics](#admin-analytics)
10. [Performance Monitoring](#performance-monitoring)

---

## User Management

### Get User Profile

```typescript
import { createClient } from '@/lib/supabase/client'

async function getUserProfile(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
```

### Update User Profile

```typescript
async function updateProfile(userId: string, updates: ProfileUpdate) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.full_name,
      company_name: updates.company_name,
      phone: updates.phone,
      timezone: updates.timezone,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Update Last Login

```typescript
async function updateLastLogin(userId: string) {
  const supabase = createClient()

  await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
}
```

---

## Subscription Queries

### Get Active Subscription

```typescript
async function getActiveSubscription(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No active subscription found
      return null
    }
    throw error
  }

  return data
}
```

### Check Subscription Status

```typescript
async function checkSubscriptionAccess(userId: string) {
  const subscription = await getActiveSubscription(userId)

  if (!subscription) {
    return { plan: 'free', hasAccess: true, features: ['basic'] }
  }

  const isActive = subscription.status === 'active'
  const isTrial = subscription.status === 'trialing'
  const hasAccess = isActive || isTrial

  return {
    plan: subscription.plan_name,
    hasAccess,
    features: PLAN_LIMITS[subscription.plan_name].features,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: subscription.current_period_end,
  }
}
```

### Create Subscription (from Stripe webhook)

```typescript
async function createSubscription(data: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePriceId: string
  planName: 'starter' | 'pro' | 'enterprise'
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
}) {
  const supabase = createClient()

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: data.userId,
      stripe_customer_id: data.stripeCustomerId,
      stripe_subscription_id: data.stripeSubscriptionId,
      stripe_price_id: data.stripePriceId,
      plan_name: data.planName,
      status: data.status as any,
      current_period_start: data.currentPeriodStart,
      current_period_end: data.currentPeriodEnd,
    })
    .select()
    .single()

  if (error) throw error

  // Also create usage tracking record
  await initializeUsageTracking(data.userId, data.planName)

  return subscription
}
```

---

## Stock Analysis

### Save Analysis Result

```typescript
async function saveAnalysis(data: {
  userId: string | null
  ticker: string
  analysisType: 'free' | 'basic' | 'advanced' | 'enterprise'
  requestData: any
  responseData: any
  sentiment?: 'bullish' | 'bearish' | 'neutral'
}) {
  const supabase = createClient()

  const { data: analysis, error } = await supabase
    .from('stock_analyses')
    .insert({
      user_id: data.userId,
      ticker: data.ticker.toUpperCase(),
      analysis_type: data.analysisType,
      request_data: data.requestData,
      response_data: data.responseData,
      sentiment: data.sentiment,
      ai_model: 'claude-sonnet-4.5',
    })
    .select()
    .single()

  if (error) throw error
  return analysis
}
```

### Get User's Recent Analyses

```typescript
async function getRecentAnalyses(userId: string, limit = 10) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stock_analyses')
    .select('id, ticker, analysis_type, sentiment, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
```

### Get Analyses for Specific Stock

```typescript
async function getStockAnalyses(userId: string, ticker: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stock_analyses')
    .select('*')
    .eq('user_id', userId)
    .eq('ticker', ticker.toUpperCase())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### Get Favorite Analyses

```typescript
async function getFavoriteAnalyses(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stock_analyses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### Mark Analysis as Favorite

```typescript
async function toggleFavorite(analysisId: string, isFavorite: boolean) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stock_analyses')
    .update({ is_favorite: isFavorite })
    .eq('id', analysisId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Add Tags to Analysis

```typescript
async function addTagsToAnalysis(analysisId: string, tags: string[]) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stock_analyses')
    .update({ tags })
    .eq('id', analysisId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Search Analyses by Tag

```typescript
async function searchByTag(userId: string, tag: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stock_analyses')
    .select('*')
    .eq('user_id', userId)
    .contains('tags', [tag])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

---

## Watchlist Operations

### Add Stock to Watchlist

```typescript
async function addToWatchlist(userId: string, ticker: string, price?: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      ticker: ticker.toUpperCase(),
      current_price: price,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      // Duplicate ticker
      throw new Error('Stock already in watchlist')
    }
    throw error
  }

  return data
}
```

### Get User's Watchlist

```typescript
async function getWatchlist(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### Update Stock Price in Watchlist

```typescript
async function updateWatchlistPrice(userId: string, ticker: string, price: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('watchlist')
    .update({ current_price: price })
    .eq('user_id', userId)
    .eq('ticker', ticker.toUpperCase())
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Remove from Watchlist

```typescript
async function removeFromWatchlist(userId: string, ticker: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('ticker', ticker.toUpperCase())

  if (error) throw error
}
```

---

## Usage Tracking

### Check Usage Limit

```typescript
async function checkUsageLimit(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .gte('period_end', new Date().toISOString())
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No usage record found, user might be new
      return { canAnalyze: false, used: 0, limit: 0, remaining: 0 }
    }
    throw error
  }

  const remaining = data.analyses_limit - data.analyses_used
  const canAnalyze = data.analyses_limit === -1 || remaining > 0

  return {
    canAnalyze,
    used: data.analyses_used,
    limit: data.analyses_limit,
    remaining: data.analyses_limit === -1 ? Infinity : remaining,
    periodEnd: data.period_end,
  }
}
```

### Increment Usage Counter

```typescript
async function incrementUsage(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('increment_usage', { p_user_id: userId })

  if (error) throw error
  return data
}

// Alternative: Direct update
async function incrementUsageDirect(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('usage_tracking')
    .update({ analyses_used: supabase.sql`analyses_used + 1` })
    .eq('user_id', userId)
    .gte('period_end', new Date().toISOString())
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Initialize Usage Tracking

```typescript
async function initializeUsageTracking(userId: string, planName: PlanName) {
  const supabase = createClient()

  const limit = PLAN_LIMITS[planName].analyses
  const periodStart = new Date()
  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  const { data, error } = await supabase
    .from('usage_tracking')
    .insert({
      user_id: userId,
      plan_name: planName,
      analyses_used: 0,
      analyses_limit: limit,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## API Usage & Rate Limiting

### Log API Request

```typescript
async function logApiRequest(data: {
  userId: string
  endpoint: string
  method: string
  requestPath: string
  responseStatus: number
  responseTimeMs: number
  ipAddress?: string
  userAgent?: string
}) {
  const supabase = createClient()

  await supabase
    .from('api_usage')
    .insert({
      user_id: data.userId,
      endpoint: data.endpoint,
      method: data.method,
      request_path: data.requestPath,
      response_status: data.responseStatus,
      response_time_ms: data.responseTimeMs,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      cost_credits: calculateCost(data.endpoint),
    })
}
```

### Check Rate Limit

```typescript
async function checkRateLimit(
  userId: string,
  endpoint: string,
  windowMinutes = 60,
  maxRequests = 100
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('check_rate_limit', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_window_minutes: windowMinutes,
      p_max_requests: maxRequests,
    })

  if (error) throw error

  const result = data[0]

  if (!result.allowed) {
    throw new Error(
      `Rate limit exceeded. ${result.current_count}/${result.limit_value} requests used. Resets at ${result.reset_at}`
    )
  }

  return result
}
```

### Get API Usage Statistics

```typescript
async function getApiUsageStats(userId: string, days = 30) {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .rpc('get_api_usage_stats', {
      p_user_id: userId,
      p_start_date: startDate.toISOString(),
      p_end_date: new Date().toISOString(),
    })

  if (error) throw error
  return data[0]
}
```

---

## User Preferences

### Get User Preferences

```typescript
async function getUserPreferences(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_user_preferences', { p_user_id: userId })

  if (error) throw error

  return data[0]?.all_preferences || {}
}
```

### Update Preferences

```typescript
async function updatePreferences(
  userId: string,
  preferences: Partial<UserPreferences>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_preferences')
    .update(preferences)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Update Theme

```typescript
async function updateTheme(userId: string, theme: 'light' | 'dark' | 'system') {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_preferences')
    .update({ theme })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## Alerts

### Create Price Alert

```typescript
async function createPriceAlert(data: {
  userId: string
  ticker: string
  alertType: 'price_above' | 'price_below'
  targetValue: number
  notifyEmail?: boolean
  notifyPush?: boolean
}) {
  const supabase = createClient()

  const { data: alert, error } = await supabase
    .from('watchlist_alerts')
    .insert({
      user_id: data.userId,
      ticker: data.ticker.toUpperCase(),
      alert_type: data.alertType,
      target_value: data.targetValue,
      notify_email: data.notifyEmail ?? true,
      notify_push: data.notifyPush ?? false,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return alert
}
```

### Get Active Alerts

```typescript
async function getActiveAlerts(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('watchlist_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### Check Alerts for Stock

```typescript
async function checkAlertsForStock(ticker: string, currentPrice: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('check_watchlist_alerts', {
      p_ticker: ticker.toUpperCase(),
      p_current_price: currentPrice,
    })

  if (error) throw error

  // Trigger notifications for alerts that should notify
  for (const alert of data.filter(a => a.should_notify)) {
    await triggerAlertNotification(alert)
  }

  return data
}

async function triggerAlertNotification(alert: any) {
  const supabase = createClient()

  // Mark alert as triggered
  await supabase.rpc('trigger_alert', {
    p_alert_id: alert.alert_id,
    p_triggered_price: alert.current_price,
  })

  // Send notification (email, push, etc.)
  // Implementation depends on notification service
}
```

### Disable Alert

```typescript
async function disableAlert(alertId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('watchlist_alerts')
    .update({ is_active: false })
    .eq('id', alertId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## Admin Analytics

### Get Subscription Analytics

```typescript
async function getSubscriptionAnalytics() {
  const supabase = createClient()

  // First refresh materialized view
  await supabase.rpc('refresh_subscription_analytics')

  const { data, error } = await supabase
    .from('subscription_analytics')
    .select('*')

  if (error) throw error
  return data
}
```

### Calculate MRR

```typescript
async function calculateMRR() {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('calculate_mrr')

  if (error) throw error

  const totalMRR = data.reduce((sum, plan) => sum + Number(plan.estimated_mrr), 0)

  return {
    byPlan: data,
    total: totalMRR,
  }
}
```

### Get Churn Analytics

```typescript
async function getChurnAnalytics(days = 30) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_churn_analytics', { p_days: days })

  if (error) throw error
  return data[0]
}
```

### Get Top Analyzed Stocks

```typescript
async function getTopAnalyzedStocks(limit = 10) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('top_analyzed_stocks')
    .select('*')
    .limit(limit)

  if (error) throw error
  return data
}
```

### Get Usage Analytics

```typescript
async function getUsageAnalytics() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('usage_analytics')
    .select('*')
    .order('usage_percentage', { ascending: false })

  if (error) throw error
  return data
}
```

### Get User Activity Summary

```typescript
async function getUserActivitySummary(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_user_activity_summary', { p_user_id: userId })

  if (error) throw error
  return data[0]
}
```

---

## Performance Monitoring

### Explain Query Plan

```sql
-- Run in Supabase SQL Editor
EXPLAIN ANALYZE
SELECT sa.*, p.email
FROM stock_analyses sa
JOIN profiles p ON p.id = sa.user_id
WHERE sa.ticker = 'AAPL'
  AND sa.created_at >= NOW() - INTERVAL '30 days'
ORDER BY sa.created_at DESC
LIMIT 10;
```

### Check Index Usage

```sql
-- Check if indexes are being used
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

### Find Slow Queries

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Best Practices

### 1. Always Use Transactions for Multi-Step Operations

```typescript
async function createUserWithDefaults(email: string, fullName: string) {
  const supabase = createClient()

  // Supabase automatically handles this via triggers, but for custom logic:
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({ email, full_name: fullName })
    .select()
    .single()

  if (profileError) throw profileError

  // Initialize preferences (handled by trigger, shown for reference)
  const { error: prefError } = await supabase
    .from('user_preferences')
    .insert({ user_id: profile.id })

  if (prefError) {
    // Rollback would be needed if not using triggers
    throw prefError
  }

  return profile
}
```

### 2. Handle RLS Policy Errors

```typescript
async function safeQuery<T>(queryFn: () => Promise<{ data: T | null, error: any }>) {
  const { data, error } = await queryFn()

  if (error) {
    if (error.code === 'PGRST301') {
      // RLS policy violation
      throw new Error('Access denied')
    }
    if (error.code === 'PGRST116') {
      // No rows returned (not necessarily an error)
      return null
    }
    throw error
  }

  return data
}
```

### 3. Use Type Safety

```typescript
import type { StockAnalysis, Watchlist } from '@/lib/supabase/types'

async function getTypedWatchlist(userId: string): Promise<Watchlist[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data as Watchlist[]
}
```

### 4. Implement Proper Error Handling

```typescript
async function robustQuery(userId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to fetch profile')
    }

    return data
  } catch (err) {
    console.error('Unexpected error:', err)
    throw err
  }
}
```

---

## Maintenance Queries

### Clean Up Old API Logs

```typescript
async function cleanupOldLogs(retentionDays = 90) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('cleanup_old_api_logs', { p_retention_days: retentionDays })

  if (error) throw error

  console.log(`Deleted ${data} old API log entries`)
  return data
}
```

### Reset Monthly Usage (Cron Job)

```typescript
async function resetMonthlyUsageCron() {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('reset_monthly_usage')

  if (error) throw error

  console.log(`Reset usage for ${data.length} users`)
  return data
}
```

### Refresh Analytics Views (Cron Job)

```typescript
async function refreshAnalyticsCron() {
  const supabase = createClient()

  await supabase.rpc('refresh_subscription_analytics')

  console.log('Analytics views refreshed')
}
```
