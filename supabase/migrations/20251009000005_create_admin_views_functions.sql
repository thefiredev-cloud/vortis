-- Migration: Create admin views and utility functions
-- Version: 20251009000005
-- Description: Admin dashboard views and helper functions for monitoring and analytics

-- Create materialized view for subscription analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.subscription_analytics AS
SELECT
  s.plan_name,
  s.status,
  COUNT(DISTINCT s.user_id) AS user_count,
  COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END) AS active_users,
  COUNT(DISTINCT CASE WHEN s.cancel_at_period_end THEN s.user_id END) AS churning_users,
  ROUND(AVG(EXTRACT(EPOCH FROM (s.current_period_end - s.current_period_start)) / 86400), 2) AS avg_subscription_days,
  MIN(s.created_at) AS first_subscription,
  MAX(s.created_at) AS latest_subscription
FROM public.subscriptions s
GROUP BY s.plan_name, s.status;

-- Create index on materialized view
CREATE INDEX idx_subscription_analytics_plan ON public.subscription_analytics(plan_name);

-- Refresh function for subscription analytics
CREATE OR REPLACE FUNCTION public.refresh_subscription_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.subscription_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for usage analytics
CREATE OR REPLACE VIEW public.usage_analytics AS
SELECT
  ut.user_id,
  p.email,
  ut.plan_name,
  ut.analyses_used,
  ut.analyses_limit,
  ROUND((ut.analyses_used::NUMERIC / NULLIF(ut.analyses_limit, 0)::NUMERIC) * 100, 2) AS usage_percentage,
  ut.period_start,
  ut.period_end,
  CASE
    WHEN ut.analyses_used >= ut.analyses_limit THEN 'at_limit'
    WHEN ut.analyses_used >= (ut.analyses_limit * 0.8) THEN 'high'
    WHEN ut.analyses_used >= (ut.analyses_limit * 0.5) THEN 'medium'
    ELSE 'low'
  END AS usage_level,
  (ut.period_end - NOW()) AS time_remaining
FROM public.usage_tracking ut
JOIN public.profiles p ON p.id = ut.user_id
WHERE ut.period_end > NOW();

-- Create view for top analyzed stocks
CREATE OR REPLACE VIEW public.top_analyzed_stocks AS
SELECT
  sa.ticker,
  COUNT(*) AS analysis_count,
  COUNT(DISTINCT sa.user_id) AS unique_users,
  MAX(sa.created_at) AS last_analyzed,
  ROUND(AVG(CASE
    WHEN sa.sentiment = 'bullish' THEN 1
    WHEN sa.sentiment = 'bearish' THEN -1
    ELSE 0
  END), 2) AS avg_sentiment,
  jsonb_agg(DISTINCT sa.analysis_type) AS analysis_types
FROM public.stock_analyses sa
WHERE sa.created_at >= NOW() - INTERVAL '30 days'
GROUP BY sa.ticker
ORDER BY analysis_count DESC
LIMIT 100;

-- Create function to get user activity summary
CREATE OR REPLACE FUNCTION public.get_user_activity_summary(p_user_id UUID)
RETURNS TABLE (
  total_analyses BIGINT,
  analyses_this_month BIGINT,
  favorite_stocks TEXT[],
  avg_analyses_per_day NUMERIC,
  most_active_day TEXT,
  subscription_plan TEXT,
  account_age_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(sa.id)::BIGINT AS total_analyses,
    COUNT(sa.id) FILTER (WHERE sa.created_at >= DATE_TRUNC('month', NOW()))::BIGINT AS analyses_this_month,
    ARRAY_AGG(DISTINCT sa.ticker ORDER BY sa.ticker) FILTER (WHERE sa.is_favorite = TRUE) AS favorite_stocks,
    ROUND(
      COUNT(sa.id)::NUMERIC / NULLIF(
        EXTRACT(EPOCH FROM (NOW() - MIN(p.created_at))) / 86400, 0
      ), 2
    ) AS avg_analyses_per_day,
    TO_CHAR(
      MODE() WITHIN GROUP (ORDER BY DATE_TRUNC('day', sa.created_at)),
      'Day'
    ) AS most_active_day,
    s.plan_name AS subscription_plan,
    EXTRACT(DAY FROM (NOW() - p.created_at))::INTEGER AS account_age_days
  FROM public.profiles p
  LEFT JOIN public.stock_analyses sa ON sa.user_id = p.id
  LEFT JOIN public.subscriptions s ON s.user_id = p.id AND s.status = 'active'
  WHERE p.id = p_user_id
  GROUP BY p.id, p.created_at, s.plan_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cleanup old API usage logs
CREATE OR REPLACE FUNCTION public.cleanup_old_api_logs(p_retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.api_usage
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset monthly usage tracking
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS TABLE (
  user_id UUID,
  old_usage INTEGER,
  new_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH updated AS (
    UPDATE public.usage_tracking
    SET
      analyses_used = 0,
      period_start = NOW(),
      period_end = NOW() + INTERVAL '1 month',
      reset_count = reset_count + 1,
      last_reset_at = NOW(),
      updated_at = NOW()
    WHERE period_end <= NOW()
    RETURNING
      usage_tracking.user_id,
      analyses_used AS old_usage,
      analyses_limit AS new_limit
  )
  SELECT * FROM updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate MRR (Monthly Recurring Revenue)
CREATE OR REPLACE FUNCTION public.calculate_mrr()
RETURNS TABLE (
  plan_name TEXT,
  active_subscriptions BIGINT,
  estimated_mrr NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.plan_name,
    COUNT(*)::BIGINT AS active_subscriptions,
    ROUND(
      COUNT(*) * CASE s.plan_name
        WHEN 'starter' THEN 29.00
        WHEN 'pro' THEN 99.00
        WHEN 'enterprise' THEN 299.00
        ELSE 0
      END,
      2
    ) AS estimated_mrr
  FROM public.subscriptions s
  WHERE s.status = 'active'
    AND s.cancel_at_period_end = FALSE
  GROUP BY s.plan_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get churn analytics
CREATE OR REPLACE FUNCTION public.get_churn_analytics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_cancellations BIGINT,
  churn_rate NUMERIC,
  top_cancellation_plans JSONB,
  avg_subscription_duration_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH cancellations AS (
    SELECT
      s.plan_name,
      s.created_at,
      s.updated_at,
      EXTRACT(EPOCH FROM (s.updated_at - s.created_at)) / 86400 AS duration_days
    FROM public.subscriptions s
    WHERE s.status = 'canceled'
      AND s.updated_at >= NOW() - (p_days || ' days')::INTERVAL
  ),
  active_subs AS (
    SELECT COUNT(*)::NUMERIC AS count
    FROM public.subscriptions
    WHERE status = 'active'
  )
  SELECT
    COUNT(*)::BIGINT AS total_cancellations,
    ROUND(
      (COUNT(*)::NUMERIC / NULLIF((SELECT count FROM active_subs), 0)) * 100,
      2
    ) AS churn_rate,
    jsonb_agg(
      jsonb_build_object(
        'plan', plan_name,
        'count', plan_count
      )
    ) AS top_cancellation_plans,
    ROUND(AVG(duration_days), 2) AS avg_subscription_duration_days
  FROM (
    SELECT
      c.plan_name,
      c.duration_days,
      COUNT(*) OVER (PARTITION BY c.plan_name) AS plan_count
    FROM cancellations c
  ) subq
  GROUP BY true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON MATERIALIZED VIEW public.subscription_analytics IS 'Aggregated subscription metrics for admin dashboard';
COMMENT ON VIEW public.usage_analytics IS 'Real-time usage statistics per user';
COMMENT ON VIEW public.top_analyzed_stocks IS 'Most analyzed stocks in the last 30 days';
COMMENT ON FUNCTION public.get_user_activity_summary IS 'Comprehensive activity summary for a user';
COMMENT ON FUNCTION public.cleanup_old_api_logs IS 'Remove API logs older than retention period';
COMMENT ON FUNCTION public.reset_monthly_usage IS 'Reset usage counters for users whose period has ended';
COMMENT ON FUNCTION public.calculate_mrr IS 'Calculate Monthly Recurring Revenue by plan';
COMMENT ON FUNCTION public.get_churn_analytics IS 'Calculate churn rate and cancellation patterns';
