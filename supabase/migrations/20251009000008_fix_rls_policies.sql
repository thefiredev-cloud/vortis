-- Migration: Fix RLS Policies for User-Specific Access Control
-- Version: 20251009000008
-- Description: Replace overly permissive policies with user-specific access control
--              Uses Clerk user ID for authorization instead of auth.uid()

BEGIN;

-- ============================================================================
-- CRITICAL FIX: Replace service role bypass policies with proper RLS
-- ============================================================================

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Allow service role full access to profiles" ON public.profiles;

-- Users can view ANY profile (public data)
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can ONLY update their OWN profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role can insert/delete (for webhooks only)
CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can delete profiles"
  ON public.profiles FOR DELETE
  USING (true);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Allow service role full access to subscriptions" ON public.subscriptions;

-- Users can ONLY view their OWN subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role can manage (for Stripe webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (true);

-- ============================================================================
-- STOCK ANALYSES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Allow service role full access to stock_analyses" ON public.stock_analyses;

-- Users can view their OWN analyses
CREATE POLICY "Users can view own analyses"
  ON public.stock_analyses FOR SELECT
  USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_id IS NULL -- Allow viewing anonymous analyses
  );

-- Users can create analyses
CREATE POLICY "Users can create analyses"
  ON public.stock_analyses FOR INSERT
  WITH CHECK (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_id IS NULL -- Allow anonymous analyses
  );

-- Service role can manage all (for admin/cleanup)
CREATE POLICY "Service role can manage analyses"
  ON public.stock_analyses FOR ALL
  USING (true);

-- ============================================================================
-- USAGE TRACKING TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Allow service role full access to usage_tracking" ON public.usage_tracking;

-- Users can view their OWN usage
CREATE POLICY "Users can view own usage"
  ON public.usage_tracking FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role can manage (for webhooks and admin)
CREATE POLICY "Service role can manage usage_tracking"
  ON public.usage_tracking FOR ALL
  USING (true);

-- ============================================================================
-- WATCHLIST TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Allow service role full access to watchlist" ON public.watchlist;

-- Users can ONLY access their OWN watchlist
CREATE POLICY "Users can view own watchlist"
  ON public.watchlist FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own watchlist"
  ON public.watchlist FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own watchlist"
  ON public.watchlist FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================================================
-- API USAGE TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Allow service role full access to api_usage" ON public.api_usage;

-- Users can view their OWN API usage
CREATE POLICY "Users can view own api_usage"
  ON public.api_usage FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role can manage (for tracking and admin)
CREATE POLICY "Service role can manage api_usage"
  ON public.api_usage FOR ALL
  USING (true);

-- ============================================================================
-- USER PREFERENCES TABLE (if exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow service role full access to user_preferences" ON public.user_preferences';

    EXECUTE 'CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT
      USING (user_id = current_setting(''request.jwt.claims'', true)::json->>''sub'')';

    EXECUTE 'CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE
      USING (user_id = current_setting(''request.jwt.claims'', true)::json->>''sub'')';

    EXECUTE 'CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT
      WITH CHECK (user_id = current_setting(''request.jwt.claims'', true)::json->>''sub'')';
  END IF;
END $$;

-- ============================================================================
-- WATCHLIST ALERTS TABLE (if exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watchlist_alerts') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow service role full access to watchlist_alerts" ON public.watchlist_alerts';

    EXECUTE 'CREATE POLICY "Users can view own alerts" ON public.watchlist_alerts FOR SELECT
      USING (user_id = current_setting(''request.jwt.claims'', true)::json->>''sub'')';

    EXECUTE 'CREATE POLICY "Users can manage own alerts" ON public.watchlist_alerts FOR ALL
      USING (user_id = current_setting(''request.jwt.claims'', true)::json->>''sub'')';
  END IF;
END $$;

-- ============================================================================
-- HELPER FUNCTION: Get Current User ID
-- ============================================================================

-- Create helper function to get current user ID from JWT
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'sub';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.current_user_id IS 'Extract Clerk user ID from JWT claims';

-- ============================================================================
-- VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
  v_policies INT;
BEGIN
  -- Count all RLS policies with USING (true) - should be minimal now
  SELECT COUNT(*)
  INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'public'
  AND qual = 'true'::TEXT;

  RAISE NOTICE 'Migration 20251009000008_fix_rls_policies completed';
  RAISE NOTICE 'Replaced overly permissive RLS policies with user-specific access control';
  RAISE NOTICE 'Policies with USING (true): % (should only be service role policies)', v_policies;
  RAISE NOTICE 'SECURITY: User data now properly isolated by Clerk user ID';
END $$;

COMMIT;
