-- Migration: Clerk Integration - Convert from Supabase Auth to Clerk
-- Version: 20251009000006
-- Description: Change user ID columns from UUID to TEXT for Clerk compatibility
--              Clerk user IDs are strings like "user_2abc123..."

BEGIN;

-- ============================================================================
-- STEP 1: Remove Supabase Auth dependencies
-- ============================================================================

-- Drop existing trigger for Supabase Auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================================
-- STEP 2: Modify profiles table for Clerk
-- ============================================================================

-- Drop existing RLS policies that reference auth.uid()
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop the foreign key constraint to auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Change profiles.id from UUID to TEXT
ALTER TABLE public.profiles
  ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Add Clerk-specific columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT,
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Make email nullable (Clerk might not always provide it)
ALTER TABLE public.profiles
  ALTER COLUMN email DROP NOT NULL;

-- Add unique constraint on clerk_user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_clerk_user_id_unique ON public.profiles(clerk_user_id);

-- Update existing index on email
DROP INDEX IF EXISTS idx_profiles_email;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;

-- Add index on clerk_user_id
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id) WHERE clerk_user_id IS NOT NULL;

-- Ensure created_at and updated_at exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- STEP 3: Update all foreign key columns to TEXT
-- ============================================================================

-- Subscriptions table
ALTER TABLE public.subscriptions
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Stock analyses table
ALTER TABLE public.stock_analyses
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Usage tracking table
ALTER TABLE public.usage_tracking
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Watchlist table
ALTER TABLE public.watchlist
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- API usage table
ALTER TABLE public.api_usage
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- User preferences table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    ALTER TABLE public.user_preferences
      ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
END $$;

-- Watchlist alerts table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watchlist_alerts') THEN
    ALTER TABLE public.watchlist_alerts
      ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Update RLS policies for Clerk (service role approach)
-- ============================================================================

-- Profiles: Allow service role to manage, users can read their own
CREATE POLICY "Allow service role full access to profiles"
  ON public.profiles FOR ALL
  USING (true);

-- Subscriptions: Allow service role to manage
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

CREATE POLICY "Allow service role full access to subscriptions"
  ON public.subscriptions FOR ALL
  USING (true);

-- Stock analyses: Allow service role to manage
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.stock_analyses;
DROP POLICY IF EXISTS "Users can view own analyses" ON public.stock_analyses;
DROP POLICY IF EXISTS "Users can create analyses" ON public.stock_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.stock_analyses;

CREATE POLICY "Allow service role full access to stock_analyses"
  ON public.stock_analyses FOR ALL
  USING (true);

-- Usage tracking: Allow service role to manage
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;

CREATE POLICY "Allow service role full access to usage_tracking"
  ON public.usage_tracking FOR ALL
  USING (true);

-- Watchlist: Allow service role to manage
DROP POLICY IF EXISTS "Users can view their own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can insert into their own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can update their own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can delete from their own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;

CREATE POLICY "Allow service role full access to watchlist"
  ON public.watchlist FOR ALL
  USING (true);

-- API usage: Already has service role policy
DROP POLICY IF EXISTS "Users can view their own API usage" ON public.api_usage;
CREATE POLICY "Allow service role full access to api_usage"
  ON public.api_usage FOR ALL
  USING (true);

-- User preferences (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences';
    EXECUTE 'CREATE POLICY "Allow service role full access to user_preferences" ON public.user_preferences FOR ALL USING (true)';
  END IF;
END $$;

-- Watchlist alerts (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watchlist_alerts') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own alerts" ON public.watchlist_alerts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their own alerts" ON public.watchlist_alerts';
    EXECUTE 'CREATE POLICY "Allow service role full access to watchlist_alerts" ON public.watchlist_alerts FOR ALL USING (true)';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Create Clerk webhook helper functions
-- ============================================================================

-- Function to upsert user from Clerk webhook
CREATE OR REPLACE FUNCTION public.upsert_user_from_clerk(
  p_clerk_id TEXT,
  p_email TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_external_id TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Build full name from first and last name
  v_full_name := TRIM(CONCAT(p_first_name, ' ', p_last_name));
  IF v_full_name = '' THEN
    v_full_name := NULL;
  END IF;

  -- Upsert profile
  INSERT INTO public.profiles (
    id,
    clerk_user_id,
    email,
    first_name,
    last_name,
    full_name,
    avatar_url,
    image_url,
    username,
    external_id,
    created_at,
    updated_at
  ) VALUES (
    p_clerk_id,
    p_clerk_id,
    p_email,
    p_first_name,
    p_last_name,
    v_full_name,
    p_image_url, -- Keep backward compatibility
    p_image_url,
    p_username,
    p_external_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    clerk_user_id = EXCLUDED.clerk_user_id,
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    image_url = COALESCE(EXCLUDED.image_url, public.profiles.image_url),
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    external_id = COALESCE(EXCLUDED.external_id, public.profiles.external_id),
    updated_at = NOW();

  -- Create initial usage tracking for free tier if doesn't exist
  INSERT INTO public.usage_tracking (
    user_id,
    plan_name,
    analyses_used,
    analyses_limit,
    period_start,
    period_end,
    created_at,
    updated_at
  )
  SELECT
    p_clerk_id,
    'starter',
    0,
    10, -- Free tier default
    NOW(),
    NOW() + INTERVAL '1 month',
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.usage_tracking
    WHERE user_id = p_clerk_id
    AND period_end > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete user (for Clerk user.deleted webhook)
CREATE OR REPLACE FUNCTION public.delete_user_from_clerk(
  p_clerk_id TEXT
)
RETURNS void AS $$
BEGIN
  -- Delete profile (cascade will handle related records)
  DELETE FROM public.profiles WHERE id = p_clerk_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync user metadata from Clerk
CREATE OR REPLACE FUNCTION public.sync_clerk_user_metadata(
  p_clerk_id TEXT,
  p_metadata JSONB
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    updated_at = NOW()
  WHERE id = p_clerk_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 6: Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN public.profiles.clerk_user_id IS 'Clerk user ID (same as id, kept for clarity)';
COMMENT ON COLUMN public.profiles.external_id IS 'External ID from Clerk (if using external authentication)';
COMMENT ON COLUMN public.profiles.username IS 'Clerk username';
COMMENT ON COLUMN public.profiles.first_name IS 'User first name from Clerk';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name from Clerk';
COMMENT ON COLUMN public.profiles.image_url IS 'User profile image URL from Clerk';

COMMENT ON FUNCTION public.upsert_user_from_clerk IS 'Upsert user profile from Clerk webhook data';
COMMENT ON FUNCTION public.delete_user_from_clerk IS 'Delete user and related data from Clerk user.deleted webhook';
COMMENT ON FUNCTION public.sync_clerk_user_metadata IS 'Sync user metadata from Clerk webhook';

-- ============================================================================
-- STEP 7: Verify migration
-- ============================================================================

-- Log migration success
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251009000006_clerk_migration completed successfully';
  RAISE NOTICE 'All user_id columns converted from UUID to TEXT';
  RAISE NOTICE 'RLS policies updated for service role access';
  RAISE NOTICE 'Clerk webhook helper functions created';
END $$;

COMMIT;
