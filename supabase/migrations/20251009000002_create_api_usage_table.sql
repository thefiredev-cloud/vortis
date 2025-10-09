-- Migration: Create API usage tracking table
-- Version: 20251009000002
-- Description: Granular API usage tracking for rate limiting and analytics

CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  request_path TEXT NOT NULL,
  request_params JSONB DEFAULT '{}'::jsonb,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  api_key_id TEXT,
  rate_limit_remaining INTEGER,
  cost_credits NUMERIC(10, 4) DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on api_usage
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- API usage policies
CREATE POLICY "Users can view their own API usage"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert API usage logs (called from API middleware)
CREATE POLICY "Service role can insert API usage"
  ON public.api_usage FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON public.api_usage(created_at DESC);
CREATE INDEX idx_api_usage_endpoint ON public.api_usage(endpoint);
CREATE INDEX idx_api_usage_response_status ON public.api_usage(response_status);

-- Composite index for user analytics queries
CREATE INDEX idx_api_usage_user_date ON public.api_usage(user_id, created_at DESC);

-- Composite index for rate limiting queries (last N minutes)
CREATE INDEX idx_api_usage_user_endpoint_date ON public.api_usage(user_id, endpoint, created_at DESC);

-- GIN index for JSONB fields
CREATE INDEX idx_api_usage_metadata_gin ON public.api_usage USING GIN (metadata);

-- Partial index for errors only
CREATE INDEX idx_api_usage_errors ON public.api_usage(user_id, created_at DESC)
  WHERE response_status >= 400;

-- Create function to calculate API usage statistics
CREATE OR REPLACE FUNCTION public.get_api_usage_stats(
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_requests BIGINT,
  successful_requests BIGINT,
  failed_requests BIGINT,
  avg_response_time_ms NUMERIC,
  total_cost_credits NUMERIC,
  top_endpoints JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_requests,
    COUNT(*) FILTER (WHERE response_status < 400)::BIGINT AS successful_requests,
    COUNT(*) FILTER (WHERE response_status >= 400)::BIGINT AS failed_requests,
    ROUND(AVG(response_time_ms)::NUMERIC, 2) AS avg_response_time_ms,
    ROUND(SUM(cost_credits)::NUMERIC, 4) AS total_cost_credits,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'endpoint', endpoint,
          'count', count,
          'avg_response_time', avg_time
        )
      )
      FROM (
        SELECT
          endpoint,
          COUNT(*)::INTEGER AS count,
          ROUND(AVG(response_time_ms)::NUMERIC, 2) AS avg_time
        FROM public.api_usage
        WHERE user_id = p_user_id
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY endpoint
        ORDER BY count DESC
        LIMIT 10
      ) top_eps
    ) AS top_endpoints
  FROM public.api_usage
  WHERE user_id = p_user_id
    AND created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_window_minutes INTEGER DEFAULT 60,
  p_max_requests INTEGER DEFAULT 100
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count BIGINT,
  limit_value INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_count BIGINT;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;

  SELECT COUNT(*) INTO v_count
  FROM public.api_usage
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND created_at >= v_window_start;

  RETURN QUERY
  SELECT
    (v_count < p_max_requests) AS allowed,
    v_count AS current_count,
    p_max_requests AS limit_value,
    v_window_start + (p_window_minutes || ' minutes')::INTERVAL AS reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE public.api_usage IS 'Granular API request tracking for rate limiting, analytics, and debugging';
COMMENT ON FUNCTION public.get_api_usage_stats IS 'Calculate API usage statistics for a user over a date range';
COMMENT ON FUNCTION public.check_rate_limit IS 'Check if user has exceeded rate limit for an endpoint';
