-- Add performance indexes for stock_analyses table
-- These indexes optimize common query patterns

-- Index for finding analyses by user and status
CREATE INDEX IF NOT EXISTS idx_stock_analyses_user_status
ON stock_analyses(user_id, status);

-- Index for finding analyses by user and created date (for recent queries)
CREATE INDEX IF NOT EXISTS idx_stock_analyses_user_created
ON stock_analyses(user_id, created_at DESC);

-- Index for finding analyses by symbol
CREATE INDEX IF NOT EXISTS idx_stock_analyses_symbol
ON stock_analyses(symbol);

-- Index for finding analyses by user and symbol
CREATE INDEX IF NOT EXISTS idx_stock_analyses_user_symbol
ON stock_analyses(user_id, symbol);

-- Index for finding pending analyses (for background job processing)
CREATE INDEX IF NOT EXISTS idx_stock_analyses_status_created
ON stock_analyses(status, created_at)
WHERE status = 'pending';

-- Add performance indexes for watchlists table

-- Index for finding watchlists by user
CREATE INDEX IF NOT EXISTS idx_watchlists_user_created
ON watchlists(user_id, created_at DESC);

-- Index for finding public watchlists
CREATE INDEX IF NOT EXISTS idx_watchlists_public_created
ON watchlists(is_public, created_at DESC)
WHERE is_public = true;

-- Add performance indexes for watchlist_items table

-- Index for finding items by watchlist
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_position
ON watchlist_items(watchlist_id, position);

-- Index for finding items by symbol
CREATE INDEX IF NOT EXISTS idx_watchlist_items_symbol
ON watchlist_items(symbol);

-- Index for finding items by watchlist and symbol (for duplicate checks)
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_symbol
ON watchlist_items(watchlist_id, symbol);

-- Add performance indexes for subscriptions table

-- Index for finding subscriptions by user
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
ON subscriptions(user_id);

-- Index for finding subscriptions by status
CREATE INDEX IF NOT EXISTS idx_subscriptions_status
ON subscriptions(status);

-- Index for finding subscriptions by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
ON subscriptions(stripe_customer_id);

-- Index for finding subscriptions by Stripe subscription ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription
ON subscriptions(stripe_subscription_id);

-- Add performance indexes for users table if needed

-- Index for finding users by email (if not already exists)
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- Comments for documentation
COMMENT ON INDEX idx_stock_analyses_user_status IS 'Optimizes queries filtering by user and status';
COMMENT ON INDEX idx_stock_analyses_user_created IS 'Optimizes queries for recent user analyses';
COMMENT ON INDEX idx_stock_analyses_symbol IS 'Optimizes queries filtering by stock symbol';
COMMENT ON INDEX idx_stock_analyses_user_symbol IS 'Optimizes queries for user-specific symbol analyses';
COMMENT ON INDEX idx_stock_analyses_status_created IS 'Optimizes background job queries for pending analyses';
COMMENT ON INDEX idx_watchlists_user_created IS 'Optimizes queries for user watchlists ordered by date';
COMMENT ON INDEX idx_watchlists_public_created IS 'Optimizes queries for public watchlists';
COMMENT ON INDEX idx_watchlist_items_watchlist_position IS 'Optimizes queries for ordered watchlist items';
COMMENT ON INDEX idx_watchlist_items_symbol IS 'Optimizes queries filtering by stock symbol';
COMMENT ON INDEX idx_watchlist_items_watchlist_symbol IS 'Optimizes duplicate detection when adding stocks';
COMMENT ON INDEX idx_subscriptions_user_id IS 'Optimizes queries for user subscriptions';
COMMENT ON INDEX idx_subscriptions_status IS 'Optimizes queries filtering by subscription status';
COMMENT ON INDEX idx_subscriptions_stripe_customer IS 'Optimizes Stripe webhook lookups by customer ID';
COMMENT ON INDEX idx_subscriptions_stripe_subscription IS 'Optimizes Stripe webhook lookups by subscription ID';
