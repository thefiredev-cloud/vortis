-- Migration: Enhance core schema with additional fields and constraints
-- Version: 20251009000001
-- Description: Add missing fields to existing tables and improve constraints

-- Add trial period support to subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add additional fields to profiles for better user management
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add notification preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS marketing_emails_enabled BOOLEAN DEFAULT TRUE;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- Add composite index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- Add tags and categories to stock analyses
ALTER TABLE public.stock_analyses
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add composite index for user analyses with filters
CREATE INDEX IF NOT EXISTS idx_stock_analyses_user_ticker ON public.stock_analyses(user_id, ticker);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_user_favorite ON public.stock_analyses(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_stock_analyses_sentiment ON public.stock_analyses(sentiment) WHERE sentiment IS NOT NULL;

-- Add GIN index for JSONB fields (faster JSON queries)
CREATE INDEX IF NOT EXISTS idx_stock_analyses_request_data_gin ON public.stock_analyses USING GIN (request_data);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_response_data_gin ON public.stock_analyses USING GIN (response_data);

-- Update RLS policy for stock analyses to support favorites
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.stock_analyses;
CREATE POLICY "Users can update their own analyses"
  ON public.stock_analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- Add constraint to ensure valid period dates
ALTER TABLE public.usage_tracking
ADD CONSTRAINT check_period_dates CHECK (period_end > period_start);

-- Add reset tracking for usage limits
ALTER TABLE public.usage_tracking
ADD COLUMN IF NOT EXISTS reset_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reset_at TIMESTAMP WITH TIME ZONE;

-- Comment on tables and important columns for documentation
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase Auth users';
COMMENT ON TABLE public.subscriptions IS 'Stripe subscription tracking with plan information';
COMMENT ON TABLE public.stock_analyses IS 'Historical stock analysis results from AI';
COMMENT ON TABLE public.usage_tracking IS 'Monthly usage tracking per user for rate limiting';

COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'If true, subscription will cancel at period end';
COMMENT ON COLUMN public.stock_analyses.analysis_type IS 'Determines depth of analysis: free, basic, advanced, enterprise';
COMMENT ON COLUMN public.usage_tracking.analyses_limit IS 'Max analyses allowed per period based on plan';
