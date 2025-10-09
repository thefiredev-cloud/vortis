-- Migration: Create watchlist alerts table
-- Version: 20251009000004
-- Description: Price alerts and notifications for watchlist items

CREATE TABLE IF NOT EXISTS public.watchlist_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,

  -- Alert configuration
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'percent_change', 'volume_spike')),
  target_value NUMERIC(10, 2) NOT NULL,

  -- Alert status
  is_active BOOLEAN DEFAULT TRUE,
  triggered_at TIMESTAMP WITH TIME ZONE,
  triggered_price NUMERIC(10, 2),
  notification_sent BOOLEAN DEFAULT FALSE,

  -- Repeat configuration
  repeat_alert BOOLEAN DEFAULT FALSE,
  cooldown_hours INTEGER DEFAULT 24,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,

  -- Notification settings
  notify_email BOOLEAN DEFAULT TRUE,
  notify_push BOOLEAN DEFAULT FALSE,
  notify_webhook BOOLEAN DEFAULT FALSE,

  -- Additional context
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on watchlist_alerts
ALTER TABLE public.watchlist_alerts ENABLE ROW LEVEL SECURITY;

-- Watchlist alerts policies
CREATE POLICY "Users can view their own alerts"
  ON public.watchlist_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON public.watchlist_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.watchlist_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON public.watchlist_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_watchlist_alerts_user_id ON public.watchlist_alerts(user_id);
CREATE INDEX idx_watchlist_alerts_ticker ON public.watchlist_alerts(ticker);
CREATE INDEX idx_watchlist_alerts_active ON public.watchlist_alerts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_watchlist_alerts_user_ticker ON public.watchlist_alerts(user_id, ticker);

-- Composite index for checking alerts that need to be triggered
CREATE INDEX idx_watchlist_alerts_check ON public.watchlist_alerts(is_active, ticker, alert_type)
  WHERE is_active = TRUE AND notification_sent = FALSE;

-- Add updated_at trigger
CREATE TRIGGER update_watchlist_alerts_updated_at
  BEFORE UPDATE ON public.watchlist_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check and trigger alerts
CREATE OR REPLACE FUNCTION public.check_watchlist_alerts(
  p_ticker TEXT,
  p_current_price NUMERIC,
  p_volume BIGINT DEFAULT NULL
)
RETURNS TABLE (
  alert_id UUID,
  user_id UUID,
  alert_type TEXT,
  should_notify BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH alerts_to_check AS (
    SELECT
      wa.id,
      wa.user_id,
      wa.alert_type,
      wa.target_value,
      wa.repeat_alert,
      wa.cooldown_hours,
      wa.last_triggered_at,
      wa.notify_email,
      wa.notify_push,
      wa.notify_webhook
    FROM public.watchlist_alerts wa
    WHERE wa.ticker = p_ticker
      AND wa.is_active = TRUE
      AND wa.notification_sent = FALSE
  )
  SELECT
    ac.id AS alert_id,
    ac.user_id,
    ac.alert_type,
    CASE
      -- Check if alert condition is met
      WHEN ac.alert_type = 'price_above' AND p_current_price >= ac.target_value THEN TRUE
      WHEN ac.alert_type = 'price_below' AND p_current_price <= ac.target_value THEN TRUE
      -- Check cooldown period for repeat alerts
      WHEN ac.repeat_alert = TRUE
        AND ac.last_triggered_at IS NOT NULL
        AND ac.last_triggered_at + (ac.cooldown_hours || ' hours')::INTERVAL > NOW() THEN FALSE
      ELSE FALSE
    END AS should_notify
  FROM alerts_to_check ac
  WHERE CASE
    WHEN ac.alert_type = 'price_above' THEN p_current_price >= ac.target_value
    WHEN ac.alert_type = 'price_below' THEN p_current_price <= ac.target_value
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark alert as triggered
CREATE OR REPLACE FUNCTION public.trigger_alert(
  p_alert_id UUID,
  p_triggered_price NUMERIC
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.watchlist_alerts
  SET
    triggered_at = NOW(),
    triggered_price = p_triggered_price,
    notification_sent = TRUE,
    last_triggered_at = NOW(),
    trigger_count = trigger_count + 1,
    updated_at = NOW()
  WHERE id = p_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE public.watchlist_alerts IS 'Price alerts and notifications for watchlist stocks';
COMMENT ON FUNCTION public.check_watchlist_alerts IS 'Check if any alerts should be triggered for a stock based on current price';
COMMENT ON FUNCTION public.trigger_alert IS 'Mark an alert as triggered and update notification status';
