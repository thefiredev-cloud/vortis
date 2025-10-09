-- =====================================================
-- VORTIS DATABASE: APPLY ALL MIGRATIONS
-- =====================================================
-- This file consolidates all migrations for manual application
-- via the Supabase Dashboard SQL Editor
--
-- Project: Vortis (bgywvwxqrijncqgdwsle)
-- Region: West US (North California)
-- Date: 2025-10-09
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- MIGRATION 002: Create Watchlist Table
-- =====================================================

-- Create watchlist table
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  current_price NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- Enable RLS on watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Watchlist policies
DO $$ BEGIN
  CREATE POLICY "Users can view their own watchlist"
    ON public.watchlist FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert into their own watchlist"
    ON public.watchlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own watchlist"
    ON public.watchlist FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete from their own watchlist"
    ON public.watchlist FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add updated_at trigger
DO $$ BEGIN
  CREATE TRIGGER update_watchlist_updated_at
    BEFORE UPDATE ON public.watchlist
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_ticker ON public.watchlist(ticker);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON public.watchlist(created_at DESC);

-- =====================================================
-- MIGRATION 20251009000001: Enhance Core Schema
-- =====================================================

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
DO $$ BEGIN
  CREATE POLICY "Users can update their own analyses"
    ON public.stock_analyses FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add constraint to ensure valid period dates
DO $$ BEGIN
  ALTER TABLE public.usage_tracking
  ADD CONSTRAINT check_period_dates CHECK (period_end > period_start);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

-- =====================================================
-- Apply remaining migrations by reading from files
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 002 and 20251009000001 applied successfully';
  RAISE NOTICE 'Please run the following migrations manually in this order:';
  RAISE NOTICE '1. supabase/migrations/20251009000002_create_api_usage_table.sql';
  RAISE NOTICE '2. supabase/migrations/20251009000003_create_user_preferences_table.sql';
  RAISE NOTICE '3. supabase/migrations/20251009000004_create_watchlist_alerts_table.sql';
  RAISE NOTICE '4. supabase/migrations/20251009000005_create_admin_views_functions.sql';
END $$;
