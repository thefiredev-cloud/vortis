-- Add validation constraints to ensure data integrity

-- Stock Analyses table constraints

-- Ensure symbol is uppercase and alphanumeric only
ALTER TABLE stock_analyses
ADD CONSTRAINT check_symbol_format
CHECK (symbol ~ '^[A-Z]+$');

-- Ensure analysis_type is one of the allowed values
ALTER TABLE stock_analyses
ADD CONSTRAINT check_analysis_type
CHECK (analysis_type IN ('fundamental', 'technical', 'comprehensive'));

-- Ensure status is one of the allowed values
ALTER TABLE stock_analyses
ADD CONSTRAINT check_analysis_status
CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

-- Ensure summary is not empty when status is completed
ALTER TABLE stock_analyses
ADD CONSTRAINT check_completed_has_summary
CHECK (
  status != 'completed' OR
  (summary IS NOT NULL AND length(trim(summary)) > 0)
);

-- Watchlists table constraints

-- Ensure name is not empty or just whitespace
ALTER TABLE watchlists
ADD CONSTRAINT check_watchlist_name_not_empty
CHECK (length(trim(name)) > 0);

-- Ensure name is not too long
ALTER TABLE watchlists
ADD CONSTRAINT check_watchlist_name_length
CHECK (length(name) <= 50);

-- Ensure description is not too long if provided
ALTER TABLE watchlists
ADD CONSTRAINT check_watchlist_description_length
CHECK (description IS NULL OR length(description) <= 200);

-- Ensure item_count is non-negative
ALTER TABLE watchlists
ADD CONSTRAINT check_item_count_non_negative
CHECK (item_count >= 0);

-- Watchlist Items table constraints

-- Ensure symbol is uppercase and alphanumeric only
ALTER TABLE watchlist_items
ADD CONSTRAINT check_item_symbol_format
CHECK (symbol ~ '^[A-Z]+$');

-- Ensure position is non-negative
ALTER TABLE watchlist_items
ADD CONSTRAINT check_item_position_non_negative
CHECK (position >= 0);

-- Ensure target_price is positive if set
ALTER TABLE watchlist_items
ADD CONSTRAINT check_target_price_positive
CHECK (target_price IS NULL OR target_price > 0);

-- Ensure alert_price is positive if set
ALTER TABLE watchlist_items
ADD CONSTRAINT check_alert_price_positive
CHECK (alert_price IS NULL OR alert_price > 0);

-- Ensure added_price is positive if set
ALTER TABLE watchlist_items
ADD CONSTRAINT check_added_price_positive
CHECK (added_price IS NULL OR added_price > 0);

-- Ensure notes are not too long if provided
ALTER TABLE watchlist_items
ADD CONSTRAINT check_item_notes_length
CHECK (notes IS NULL OR length(notes) <= 500);

-- Ensure unique symbol per watchlist
CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlist_items_unique_symbol
ON watchlist_items(watchlist_id, symbol);

-- Subscriptions table constraints

-- Ensure plan_name is one of the allowed values
ALTER TABLE subscriptions
ADD CONSTRAINT check_plan_name
CHECK (plan_name IN ('starter', 'pro', 'enterprise'));

-- Ensure status is one of the allowed values
ALTER TABLE subscriptions
ADD CONSTRAINT check_subscription_status
CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete'));

-- Ensure Stripe customer ID format
ALTER TABLE subscriptions
ADD CONSTRAINT check_stripe_customer_id_format
CHECK (stripe_customer_id ~ '^cus_');

-- Ensure Stripe subscription ID format
ALTER TABLE subscriptions
ADD CONSTRAINT check_stripe_subscription_id_format
CHECK (stripe_subscription_id ~ '^sub_');

-- Ensure Stripe price ID format
ALTER TABLE subscriptions
ADD CONSTRAINT check_stripe_price_id_format
CHECK (stripe_price_id ~ '^price_');

-- Ensure period end is after period start
ALTER TABLE subscriptions
ADD CONSTRAINT check_period_dates
CHECK (current_period_end > current_period_start);

-- Ensure trial end is after trial start if both are set
ALTER TABLE subscriptions
ADD CONSTRAINT check_trial_dates
CHECK (
  trial_start IS NULL OR
  trial_end IS NULL OR
  trial_end > trial_start
);

-- Users table constraints

-- Ensure email format is valid
ALTER TABLE users
ADD CONSTRAINT check_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure full_name is not empty or just whitespace
ALTER TABLE users
ADD CONSTRAINT check_full_name_not_empty
CHECK (full_name IS NULL OR length(trim(full_name)) > 0);

-- Comments for documentation
COMMENT ON CONSTRAINT check_symbol_format ON stock_analyses IS 'Ensures stock symbols are uppercase letters only';
COMMENT ON CONSTRAINT check_analysis_type ON stock_analyses IS 'Ensures analysis type is fundamental, technical, or comprehensive';
COMMENT ON CONSTRAINT check_analysis_status ON stock_analyses IS 'Ensures status is pending, processing, completed, or failed';
COMMENT ON CONSTRAINT check_completed_has_summary ON stock_analyses IS 'Ensures completed analyses have a non-empty summary';
COMMENT ON CONSTRAINT check_watchlist_name_not_empty ON watchlists IS 'Ensures watchlist name is not empty or whitespace';
COMMENT ON CONSTRAINT check_watchlist_name_length ON watchlists IS 'Ensures watchlist name is 50 characters or less';
COMMENT ON CONSTRAINT check_item_symbol_format ON watchlist_items IS 'Ensures stock symbols are uppercase letters only';
COMMENT ON CONSTRAINT check_plan_name ON subscriptions IS 'Ensures plan is starter, pro, or enterprise';
COMMENT ON CONSTRAINT check_subscription_status ON subscriptions IS 'Ensures subscription status is valid';
COMMENT ON CONSTRAINT check_email_format ON users IS 'Ensures email is in valid format';
