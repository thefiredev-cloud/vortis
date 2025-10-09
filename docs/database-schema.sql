-- =====================================================
-- VORTIS DATABASE SCHEMA
-- Compatible with Supabase PostgreSQL
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable timestamp helpers
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- Stores user subscription data from Stripe
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,

  -- Plan information
  plan_name TEXT NOT NULL CHECK (plan_name IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),

  -- Billing period
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_subscription UNIQUE (user_id),
  CONSTRAINT valid_period CHECK (current_period_end > current_period_start)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_name ON subscriptions(plan_name);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- USAGE TRACKING TABLE
-- Tracks user usage limits and consumption
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plan and limits
  plan_name TEXT NOT NULL CHECK (plan_name IN ('free', 'starter', 'pro', 'enterprise')),
  analyses_used INTEGER DEFAULT 0 CHECK (analyses_used >= 0),
  analyses_limit INTEGER NOT NULL, -- -1 for unlimited

  -- Tracking period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_period UNIQUE (user_id, period_start),
  CONSTRAINT valid_usage_period CHECK (period_end > period_start),
  CONSTRAINT valid_limit_check CHECK (analyses_limit = -1 OR analyses_limit >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_plan_name ON usage_tracking(plan_name);

-- Trigger for updated_at
CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STOCK ANALYSES TABLE
-- Stores user stock analysis history
-- =====================================================

CREATE TABLE IF NOT EXISTS stock_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stock information
  ticker_symbol TEXT NOT NULL,
  company_name TEXT,

  -- Analysis data (JSON for flexibility)
  analysis_data JSONB NOT NULL,

  -- Analysis metadata
  analysis_type TEXT CHECK (analysis_type IN ('basic', 'advanced', 'technical', 'fundamental')),
  sentiment TEXT CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_analyses_user_id ON stock_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_ticker ON stock_analyses(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_created_at ON stock_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_sentiment ON stock_analyses(sentiment);

-- Trigger for updated_at
CREATE TRIGGER update_stock_analyses_updated_at
    BEFORE UPDATE ON stock_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- WATCHLIST TABLE
-- User's saved stock watchlist
-- =====================================================

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stock information
  ticker_symbol TEXT NOT NULL,
  company_name TEXT,

  -- Watchlist settings
  price_alert_enabled BOOLEAN DEFAULT false,
  target_price DECIMAL(15,2),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_ticker UNIQUE (user_id, ticker_symbol)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_ticker ON watchlist(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_watchlist_price_alert ON watchlist(price_alert_enabled) WHERE price_alert_enabled = true;

-- Trigger for updated_at
CREATE TRIGGER update_watchlist_updated_at
    BEFORE UPDATE ON watchlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- USER PROFILES TABLE (Extended user data)
-- Stores additional user information beyond auth.users
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profile information
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Preferences
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  market_alerts BOOLEAN DEFAULT true,
  newsletter_subscription BOOLEAN DEFAULT true,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON user_profiles(onboarding_completed);

-- Trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PAYMENT HISTORY TABLE
-- Stores payment transaction history
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe information
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,

  -- Payment details
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),

  -- Plan information
  plan_name TEXT NOT NULL,
  billing_reason TEXT,

  -- Invoice details
  invoice_url TEXT,
  invoice_pdf TEXT,

  -- Timestamps
  payment_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_invoice_id ON payment_history(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON payment_history(payment_date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: SUBSCRIPTIONS
-- =====================================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES: USAGE TRACKING
-- =====================================================

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can manage all usage
CREATE POLICY "Service role can manage usage"
  ON usage_tracking FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES: STOCK ANALYSES
-- =====================================================

-- Users can view their own analyses
CREATE POLICY "Users can view own analyses"
  ON stock_analyses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own analyses
CREATE POLICY "Users can create own analyses"
  ON stock_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own analyses
CREATE POLICY "Users can update own analyses"
  ON stock_analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses"
  ON stock_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: WATCHLIST
-- =====================================================

-- Users can manage their own watchlist
CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own watchlist items"
  ON watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist items"
  ON watchlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items"
  ON watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: USER PROFILES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- RLS POLICIES: PAYMENT HISTORY
-- =====================================================

-- Users can view their own payment history
CREATE POLICY "Users can view own payments"
  ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage payment history (for webhooks)
CREATE POLICY "Service role can manage payments"
  ON payment_history FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email_notifications)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    true
  );

  -- Create initial usage tracking for free tier
  INSERT INTO public.usage_tracking (
    user_id,
    plan_name,
    analyses_used,
    analyses_limit,
    period_start,
    period_end
  ) VALUES (
    NEW.id,
    'free',
    0,
    10, -- Free tier: 10 analyses
    NOW(),
    NOW() + INTERVAL '30 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user has reached usage limit
CREATE OR REPLACE FUNCTION public.check_usage_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_usage usage_tracking%ROWTYPE;
BEGIN
  SELECT * INTO v_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND NOW() BETWEEN period_start AND period_end
  ORDER BY period_start DESC
  LIMIT 1;

  -- No usage record found
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Unlimited plan
  IF v_usage.analyses_limit = -1 THEN
    RETURN true;
  END IF;

  -- Check if under limit
  RETURN v_usage.analyses_used < v_usage.analyses_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE usage_tracking
  SET analyses_used = analyses_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND NOW() BETWEEN period_start AND period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  plan_name TEXT,
  status TEXT,
  is_active BOOLEAN,
  analyses_used INTEGER,
  analyses_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(s.plan_name, 'free')::TEXT,
    COALESCE(s.status, 'active')::TEXT,
    COALESCE(s.status = 'active', true)::BOOLEAN,
    COALESCE(u.analyses_used, 0)::INTEGER,
    COALESCE(u.analyses_limit, 10)::INTEGER
  FROM auth.users usr
  LEFT JOIN subscriptions s ON s.user_id = usr.id
  LEFT JOIN usage_tracking u ON u.user_id = usr.id
    AND NOW() BETWEEN u.period_start AND u.period_end
  WHERE usr.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS
-- =====================================================

-- View for active subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT
  s.*,
  u.email,
  u.created_at as user_created_at
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.status = 'active'
  AND s.current_period_end > NOW();

-- View for usage statistics
CREATE OR REPLACE VIEW usage_statistics AS
SELECT
  u.id as user_id,
  u.email,
  up.full_name,
  s.plan_name,
  ut.analyses_used,
  ut.analyses_limit,
  CASE
    WHEN ut.analyses_limit = -1 THEN 0
    ELSE ROUND((ut.analyses_used::DECIMAL / ut.analyses_limit) * 100, 2)
  END as usage_percentage,
  ut.period_start,
  ut.period_end
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN subscriptions s ON s.user_id = u.id
LEFT JOIN usage_tracking ut ON ut.user_id = u.id
  AND NOW() BETWEEN ut.period_start AND ut.period_end;

-- =====================================================
-- SCHEDULED JOBS (Using pg_cron)
-- =====================================================

-- Reset usage tracking at the start of each billing period
-- This would be configured in Supabase dashboard or via pg_cron extension
-- Example: Reset all usage on the 1st of each month
-- SELECT cron.schedule('reset-monthly-usage', '0 0 1 * *', $$
--   UPDATE usage_tracking
--   SET analyses_used = 0
--   WHERE period_end < NOW();
-- $$);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Note: Free tier is automatically created via handle_new_user() trigger
-- Subscription data is created via Stripe webhooks

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE subscriptions IS 'Stores user subscription data synced from Stripe';
COMMENT ON TABLE usage_tracking IS 'Tracks user usage limits and consumption per billing period';
COMMENT ON TABLE stock_analyses IS 'Stores historical stock analysis data';
COMMENT ON TABLE watchlist IS 'User-created watchlists for tracking stocks';
COMMENT ON TABLE user_profiles IS 'Extended user profile data beyond auth.users';
COMMENT ON TABLE payment_history IS 'Historical payment transaction records';

COMMENT ON FUNCTION check_usage_limit IS 'Checks if user has remaining analyses in current period';
COMMENT ON FUNCTION increment_usage IS 'Increments the usage counter for a user';
COMMENT ON FUNCTION get_user_subscription IS 'Returns current subscription and usage data for a user';

-- =====================================================
-- GRANTS (Permissions)
-- =====================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION check_usage_limit TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;

-- Grant select on views to authenticated users
GRANT SELECT ON active_subscriptions TO authenticated;
GRANT SELECT ON usage_statistics TO authenticated;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
