-- Migration: Create user preferences table
-- Version: 20251009000003
-- Description: Store user settings and preferences

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Display preferences
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de', 'zh', 'ja')),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CNY')),
  date_format TEXT DEFAULT 'MM/DD/YYYY' CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')),

  -- Chart and analysis preferences
  default_chart_type TEXT DEFAULT 'candlestick' CHECK (default_chart_type IN ('candlestick', 'line', 'area', 'bar')),
  default_time_range TEXT DEFAULT '1M' CHECK (default_time_range IN ('1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX')),
  show_indicators BOOLEAN DEFAULT TRUE,
  preferred_indicators TEXT[] DEFAULT ARRAY['MA', 'RSI', 'MACD'],

  -- Analysis preferences
  risk_tolerance TEXT DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  analysis_depth TEXT DEFAULT 'standard' CHECK (analysis_depth IN ('quick', 'standard', 'comprehensive')),
  auto_save_analyses BOOLEAN DEFAULT TRUE,

  -- Notification preferences
  email_alerts BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  price_alert_threshold NUMERIC(5, 2) DEFAULT 5.00,
  daily_digest BOOLEAN DEFAULT FALSE,
  weekly_summary BOOLEAN DEFAULT TRUE,

  -- Alert preferences
  alert_types JSONB DEFAULT '{
    "price_changes": true,
    "earnings_reports": true,
    "analyst_upgrades": true,
    "market_news": false
  }'::jsonb,

  -- Dashboard preferences
  dashboard_layout TEXT DEFAULT 'grid' CHECK (dashboard_layout IN ('grid', 'list', 'compact')),
  widgets_config JSONB DEFAULT '{
    "watchlist": {"enabled": true, "position": 1},
    "portfolio": {"enabled": true, "position": 2},
    "news": {"enabled": true, "position": 3},
    "market_summary": {"enabled": true, "position": 4}
  }'::jsonb,

  -- API preferences (for Enterprise users)
  api_notifications BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,

  -- Advanced settings
  advanced_settings JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- GIN index for JSONB fields
CREATE INDEX idx_user_preferences_alert_types_gin ON public.user_preferences USING GIN (alert_types);
CREATE INDEX idx_user_preferences_widgets_config_gin ON public.user_preferences USING GIN (widgets_config);
CREATE INDEX idx_user_preferences_advanced_settings_gin ON public.user_preferences USING GIN (advanced_settings);

-- Add updated_at trigger
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize default preferences for new users
CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences when profile is created
CREATE TRIGGER on_profile_created_init_preferences
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_preferences();

-- Create function to get user preferences with defaults
CREATE OR REPLACE FUNCTION public.get_user_preferences(p_user_id UUID)
RETURNS TABLE (
  theme TEXT,
  language TEXT,
  currency TEXT,
  default_chart_type TEXT,
  default_time_range TEXT,
  risk_tolerance TEXT,
  all_preferences JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(up.theme, 'dark')::TEXT,
    COALESCE(up.language, 'en')::TEXT,
    COALESCE(up.currency, 'USD')::TEXT,
    COALESCE(up.default_chart_type, 'candlestick')::TEXT,
    COALESCE(up.default_time_range, '1M')::TEXT,
    COALESCE(up.risk_tolerance, 'moderate')::TEXT,
    row_to_json(up.*)::JSONB
  FROM public.user_preferences up
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE public.user_preferences IS 'User-specific settings and preferences for customizing the Vortis experience';
COMMENT ON FUNCTION public.get_user_preferences IS 'Retrieve user preferences with fallback to default values';
