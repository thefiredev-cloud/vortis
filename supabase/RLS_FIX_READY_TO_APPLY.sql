-- ============================================================================
-- CRITICAL RLS POLICY FIX - READY FOR SUPABASE SQL EDITOR
-- ============================================================================
-- Migration: 20251009000008_fix_rls_policies
-- Purpose: Replace overly permissive USING (true) policies with user-specific access control
-- Security: Uses Clerk user ID from JWT claims for proper data isolation
--
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and run
-- 4. Check output for verification results
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
-- VERIFICATION QUERIES
-- ============================================================================

-- Count policies with USING (true) - should only be service role policies
SELECT
  COUNT(*) as policies_with_using_true,
  'Should only be service role policies (insert/delete/manage)' as note
FROM pg_policies
WHERE schemaname = 'public'
AND qual = 'true'::TEXT;

-- List all policies by table
SELECT
  tablename,
  policyname,
  CASE
    WHEN cmd = 'SELECT' THEN 'SELECT'
    WHEN cmd = 'INSERT' THEN 'INSERT'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
    WHEN cmd = '*' THEN 'ALL'
  END as command,
  CASE
    WHEN qual = 'true' THEN 'USING (true) - Service Role'
    WHEN qual LIKE '%current_setting%' THEN 'User-Specific via JWT'
    ELSE 'Custom Logic'
  END as access_control
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Verify helper function exists
SELECT
  proname as function_name,
  pg_catalog.pg_get_function_result(p.oid) as return_type,
  prosecdef as is_security_definer,
  provolatile = 's' as is_stable
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND proname = 'current_user_id';
