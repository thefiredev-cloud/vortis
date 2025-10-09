-- Migration Rollback: Revert Clerk Integration
-- Version: 20251009000007_clerk_rollback
-- WARNING: This will LOSE all Clerk user data!
-- Only use if you need to rollback to Supabase Auth

BEGIN;

-- ============================================================================
-- WARNING: Point of no return - this drops Clerk user data
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'WARNING: This rollback will delete all Clerk user data';
  RAISE NOTICE 'Press Ctrl+C now if you want to abort';
END $$;

-- ============================================================================
-- STEP 1: Drop Clerk-specific functions
-- ============================================================================

DROP FUNCTION IF EXISTS public.upsert_user_from_clerk(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.delete_user_from_clerk(TEXT);
DROP FUNCTION IF EXISTS public.sync_clerk_user_metadata(TEXT, JSONB);

-- ============================================================================
-- STEP 2: Drop Clerk-specific policies
-- ============================================================================

DROP POLICY IF EXISTS "Allow service role full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role full access to subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow service role full access to stock_analyses" ON public.stock_analyses;
DROP POLICY IF EXISTS "Allow service role full access to usage_tracking" ON public.usage_tracking;
DROP POLICY IF EXISTS "Allow service role full access to watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Allow service role full access to api_usage" ON public.api_usage;

-- ============================================================================
-- STEP 3: Remove Clerk-specific columns from profiles
-- ============================================================================

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS clerk_user_id,
  DROP COLUMN IF EXISTS external_id,
  DROP COLUMN IF EXISTS username,
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  DROP COLUMN IF EXISTS image_url;

-- Make email required again
ALTER TABLE public.profiles
  ALTER COLUMN email SET NOT NULL;

-- ============================================================================
-- STEP 4: Delete all existing data (required before converting to UUID)
-- ============================================================================

-- WARNING: This deletes all user data!
TRUNCATE TABLE public.api_usage CASCADE;
TRUNCATE TABLE public.watchlist CASCADE;
TRUNCATE TABLE public.stock_analyses CASCADE;
TRUNCATE TABLE public.usage_tracking CASCADE;
TRUNCATE TABLE public.subscriptions CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    EXECUTE 'TRUNCATE TABLE public.user_preferences CASCADE';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watchlist_alerts') THEN
    EXECUTE 'TRUNCATE TABLE public.watchlist_alerts CASCADE';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Convert all user_id columns back to UUID
-- ============================================================================

-- Profiles table
ALTER TABLE public.profiles
  ALTER COLUMN id TYPE UUID USING id::UUID;

-- Subscriptions table
ALTER TABLE public.subscriptions
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Stock analyses table
ALTER TABLE public.stock_analyses
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Usage tracking table
ALTER TABLE public.usage_tracking
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Watchlist table
ALTER TABLE public.watchlist
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- API usage table
ALTER TABLE public.api_usage
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- User preferences table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    ALTER TABLE public.user_preferences
      ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
  END IF;
END $$;

-- Watchlist alerts table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watchlist_alerts') THEN
    ALTER TABLE public.watchlist_alerts
      ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Restore foreign key to auth.users
-- ============================================================================

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);

-- ============================================================================
-- STEP 7: Restore Supabase Auth RLS policies
-- ============================================================================

-- Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Stock analyses
CREATE POLICY "Users can view their own analyses"
  ON public.stock_analyses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create analyses"
  ON public.stock_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own analyses"
  ON public.stock_analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- Usage tracking
CREATE POLICY "Users can view their own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Watchlist
CREATE POLICY "Users can view their own watchlist"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist"
  ON public.watchlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- API usage
CREATE POLICY "Users can view their own API usage"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert API usage"
  ON public.api_usage FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STEP 8: Restore Supabase Auth trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 9: Drop Clerk-specific indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_profiles_clerk_user_id_unique;
DROP INDEX IF EXISTS idx_profiles_clerk_user_id;

-- ============================================================================
-- Completion
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Rollback completed - reverted to Supabase Auth';
  RAISE NOTICE 'All Clerk user data has been deleted';
  RAISE NOTICE 'Database is now using UUID user IDs again';
END $$;

COMMIT;
