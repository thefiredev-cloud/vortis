# Database Migration Guide

This guide provides instructions for applying database migrations to your Vortis Supabase instance.

## Overview

The migrations in this directory add:

1. **Performance Indexes** (`20251025000001_add_recommended_indexes.sql`)
   - Indexes for stock_analyses table
   - Indexes for watchlists table
   - Indexes for watchlist_items table
   - Indexes for subscriptions table

2. **Validation Constraints** (`20251025000002_add_validation_constraints.sql`)
   - Data format validation
   - Business rule constraints
   - Unique constraints

## Prerequisites

- Access to your Supabase dashboard
- Admin privileges on the database
- Backup of your database (recommended)

## Migration Methods

### Method 1: Supabase Dashboard (Recommended for Production)

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy the contents of `20251025000001_add_recommended_indexes.sql`
5. Run the query
6. Repeat for `20251025000002_add_validation_constraints.sql`

### Method 2: Supabase CLI (Recommended for Development)

```bash
# Make sure you're in the project directory
cd /Users/tanner-osterkamp/vortis

# Link to your Supabase project if not already linked
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Method 3: Direct psql Connection

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
\i supabase/migrations/20251025000001_add_recommended_indexes.sql
\i supabase/migrations/20251025000002_add_validation_constraints.sql
```

## Verification

After applying the migrations, verify they were successful:

```sql
-- Check indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename IN ('stock_analyses', 'watchlists', 'watchlist_items', 'subscriptions')
ORDER BY tablename, indexname;

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid IN (
  'stock_analyses'::regclass,
  'watchlists'::regclass,
  'watchlist_items'::regclass,
  'subscriptions'::regclass
)
ORDER BY conrelid::regclass::text, conname;
```

## Expected Results

### Indexes Created

**stock_analyses:**
- `idx_stock_analyses_user_status`
- `idx_stock_analyses_user_created`
- `idx_stock_analyses_symbol`
- `idx_stock_analyses_user_symbol`
- `idx_stock_analyses_status_created`

**watchlists:**
- `idx_watchlists_user_created`
- `idx_watchlists_public_created`

**watchlist_items:**
- `idx_watchlist_items_watchlist_position`
- `idx_watchlist_items_symbol`
- `idx_watchlist_items_watchlist_symbol`
- `idx_watchlist_items_unique_symbol` (unique)

**subscriptions:**
- `idx_subscriptions_user_id`
- `idx_subscriptions_status`
- `idx_subscriptions_stripe_customer`
- `idx_subscriptions_stripe_subscription`

### Constraints Added

**stock_analyses:**
- `check_symbol_format` - Symbol must be uppercase letters
- `check_analysis_type` - Type must be fundamental/technical/comprehensive
- `check_analysis_status` - Status must be pending/processing/completed/failed
- `check_completed_has_summary` - Completed analyses must have summary

**watchlists:**
- `check_watchlist_name_not_empty` - Name cannot be empty
- `check_watchlist_name_length` - Name max 50 chars
- `check_watchlist_description_length` - Description max 200 chars
- `check_item_count_non_negative` - Item count >= 0

**watchlist_items:**
- `check_item_symbol_format` - Symbol must be uppercase letters
- `check_item_position_non_negative` - Position >= 0
- `check_target_price_positive` - Target price > 0 if set
- `check_alert_price_positive` - Alert price > 0 if set
- `check_added_price_positive` - Added price > 0 if set
- `check_item_notes_length` - Notes max 500 chars

**subscriptions:**
- `check_plan_name` - Plan must be starter/pro/enterprise
- `check_subscription_status` - Valid subscription status
- `check_stripe_customer_id_format` - Must start with 'cus_'
- `check_stripe_subscription_id_format` - Must start with 'sub_'
- `check_stripe_price_id_format` - Must start with 'price_'
- `check_period_dates` - End date after start date
- `check_trial_dates` - Trial end after trial start

**users:**
- `check_email_format` - Valid email format
- `check_full_name_not_empty` - Name not empty if provided

## Rollback

If you need to rollback the migrations:

### To Remove Indexes

```sql
-- Drop stock_analyses indexes
DROP INDEX IF EXISTS idx_stock_analyses_user_status;
DROP INDEX IF EXISTS idx_stock_analyses_user_created;
DROP INDEX IF EXISTS idx_stock_analyses_symbol;
DROP INDEX IF EXISTS idx_stock_analyses_user_symbol;
DROP INDEX IF EXISTS idx_stock_analyses_status_created;

-- Drop watchlists indexes
DROP INDEX IF EXISTS idx_watchlists_user_created;
DROP INDEX IF EXISTS idx_watchlists_public_created;

-- Drop watchlist_items indexes
DROP INDEX IF EXISTS idx_watchlist_items_watchlist_position;
DROP INDEX IF EXISTS idx_watchlist_items_symbol;
DROP INDEX IF EXISTS idx_watchlist_items_watchlist_symbol;
DROP INDEX IF EXISTS idx_watchlist_items_unique_symbol;

-- Drop subscriptions indexes
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_stripe_customer;
DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription;
```

### To Remove Constraints

```sql
-- Drop stock_analyses constraints
ALTER TABLE stock_analyses DROP CONSTRAINT IF EXISTS check_symbol_format;
ALTER TABLE stock_analyses DROP CONSTRAINT IF EXISTS check_analysis_type;
ALTER TABLE stock_analyses DROP CONSTRAINT IF EXISTS check_analysis_status;
ALTER TABLE stock_analyses DROP CONSTRAINT IF EXISTS check_completed_has_summary;

-- Drop watchlists constraints
ALTER TABLE watchlists DROP CONSTRAINT IF EXISTS check_watchlist_name_not_empty;
ALTER TABLE watchlists DROP CONSTRAINT IF EXISTS check_watchlist_name_length;
ALTER TABLE watchlists DROP CONSTRAINT IF EXISTS check_watchlist_description_length;
ALTER TABLE watchlists DROP CONSTRAINT IF EXISTS check_item_count_non_negative;

-- Drop watchlist_items constraints
ALTER TABLE watchlist_items DROP CONSTRAINT IF EXISTS check_item_symbol_format;
ALTER TABLE watchlist_items DROP CONSTRAINT IF EXISTS check_item_position_non_negative;
ALTER TABLE watchlist_items DROP CONSTRAINT IF EXISTS check_target_price_positive;
ALTER TABLE watchlist_items DROP CONSTRAINT IF EXISTS check_alert_price_positive;
ALTER TABLE watchlist_items DROP CONSTRAINT IF EXISTS check_added_price_positive;
ALTER TABLE watchlist_items DROP CONSTRAINT IF EXISTS check_item_notes_length;

-- Drop subscriptions constraints
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_plan_name;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_subscription_status;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_stripe_customer_id_format;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_stripe_subscription_id_format;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_stripe_price_id_format;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_period_dates;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_trial_dates;

-- Drop users constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_email_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_full_name_not_empty;
```

## Performance Impact

- **Indexes**: Minimal impact on writes, significant improvement on reads
- **Constraints**: Minimal overhead, validates data on insert/update
- **Storage**: Indexes will increase database size by approximately 5-10%

## Support

If you encounter any issues:

1. Check the Supabase logs for error messages
2. Verify your database schema matches expected structure
3. Ensure no existing data violates the new constraints
4. Contact the development team with specific error messages

## Notes

- These migrations are idempotent (can be run multiple times safely)
- All operations use `IF EXISTS` or `IF NOT EXISTS` to prevent errors
- Constraints will fail if existing data violates them
- You may need to clean up invalid data before applying constraints
