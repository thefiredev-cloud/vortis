# Clerk Database Migration Verification

## Overview
This document contains verification queries to ensure the Clerk migration was successful.

## Pre-Migration Checks

### Check Current Schema (Before Migration)
```sql
-- Check if profiles.id is UUID
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('id', 'user_id');

-- Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Check existing RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Post-Migration Verification

### 1. Verify Column Type Changes

```sql
-- Verify all user_id columns are TEXT
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE column_name IN ('id', 'user_id')
  AND table_schema = 'public'
ORDER BY table_name, column_name;

-- Expected output: All should be 'text' not 'uuid'
```

### 2. Verify Clerk-Specific Columns

```sql
-- Check new Clerk columns in profiles table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'clerk_user_id',
    'external_id',
    'username',
    'first_name',
    'last_name',
    'image_url',
    'email'
  )
ORDER BY column_name;

-- Verify email is nullable
SELECT
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'email';
-- Expected: is_nullable = 'YES'
```

### 3. Verify Indexes

```sql
-- Check indexes on profiles table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
  AND schemaname = 'public'
ORDER BY indexname;

-- Should include:
-- - idx_profiles_clerk_user_id
-- - idx_profiles_clerk_user_id_unique
-- - idx_profiles_email
```

### 4. Verify Foreign Key Constraints

```sql
-- Check that auth.users foreign key is removed
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'profiles';

-- Expected: No constraint to auth.users
```

### 5. Verify RLS Policies

```sql
-- Check new RLS policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'subscriptions',
    'stock_analyses',
    'usage_tracking',
    'watchlist',
    'api_usage'
  )
ORDER BY tablename, policyname;

-- Expected: All tables should have "Allow service role full access" policy
```

### 6. Verify Helper Functions

```sql
-- Check that Clerk helper functions exist
SELECT
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%clerk%'
ORDER BY routine_name;

-- Expected functions:
-- - upsert_user_from_clerk
-- - delete_user_from_clerk
-- - sync_clerk_user_metadata
```

### 7. Verify Triggers

```sql
-- Check that Supabase Auth trigger is removed
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Expected: No results (trigger should be dropped)

-- Check that updated_at trigger still exists
SELECT
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table IN (
  'profiles',
  'subscriptions',
  'usage_tracking',
  'watchlist'
)
ORDER BY event_object_table, trigger_name;

-- Expected: update_*_updated_at triggers still present
```

## Functional Tests

### 1. Test User Creation Function

```sql
-- Test creating a new user
SELECT public.upsert_user_from_clerk(
  'user_test123abc',
  'test@example.com',
  'John',
  'Doe',
  'https://example.com/avatar.jpg',
  'johndoe',
  NULL
);

-- Verify user was created
SELECT * FROM public.profiles WHERE id = 'user_test123abc';

-- Expected: Profile should exist with correct data

-- Clean up test user
DELETE FROM public.profiles WHERE id = 'user_test123abc';
```

### 2. Test User Update

```sql
-- Create test user
SELECT public.upsert_user_from_clerk(
  'user_test456def',
  'test2@example.com',
  'Jane',
  'Smith',
  NULL,
  NULL,
  NULL
);

-- Update same user
SELECT public.upsert_user_from_clerk(
  'user_test456def',
  'updated@example.com',
  'Jane',
  'Doe',  -- Changed last name
  'https://example.com/new-avatar.jpg',
  'janedoe',
  'ext123'
);

-- Verify update
SELECT
  email,
  first_name,
  last_name,
  username,
  image_url,
  external_id
FROM public.profiles
WHERE id = 'user_test456def';

-- Expected: All fields should be updated

-- Clean up
DELETE FROM public.profiles WHERE id = 'user_test456def';
```

### 3. Test Cascade Deletion

```sql
-- Create test user with related data
SELECT public.upsert_user_from_clerk(
  'user_test789ghi',
  'test3@example.com',
  'Test',
  'User',
  NULL,
  NULL,
  NULL
);

-- Add related data
INSERT INTO public.watchlist (user_id, ticker, notes)
VALUES ('user_test789ghi', 'AAPL', 'Test watchlist item');

INSERT INTO public.stock_analyses (user_id, ticker, analysis_type, request_data, response_data)
VALUES (
  'user_test789ghi',
  'AAPL',
  'free',
  '{"ticker": "AAPL"}'::jsonb,
  '{"analysis": "test"}'::jsonb
);

-- Verify data exists
SELECT 'watchlist' as table_name, COUNT(*) as count
FROM public.watchlist WHERE user_id = 'user_test789ghi'
UNION ALL
SELECT 'stock_analyses', COUNT(*)
FROM public.stock_analyses WHERE user_id = 'user_test789ghi'
UNION ALL
SELECT 'profiles', COUNT(*)
FROM public.profiles WHERE id = 'user_test789ghi';

-- Delete user
SELECT public.delete_user_from_clerk('user_test789ghi');

-- Verify all data is deleted
SELECT 'watchlist' as table_name, COUNT(*) as count
FROM public.watchlist WHERE user_id = 'user_test789ghi'
UNION ALL
SELECT 'stock_analyses', COUNT(*)
FROM public.stock_analyses WHERE user_id = 'user_test789ghi'
UNION ALL
SELECT 'profiles', COUNT(*)
FROM public.profiles WHERE id = 'user_test789ghi';

-- Expected: All counts should be 0
```

### 4. Test RLS with Service Role

```sql
-- This should be tested from your application using service role key

-- In your API route, verify you can:
-- 1. Read any user's profile
-- 2. Update any user's profile
-- 3. Create records for any user
-- 4. Delete records for any user
```

## Data Integrity Checks

### 1. Check for Orphaned Records

```sql
-- Find subscriptions without profiles
SELECT COUNT(*) as orphaned_subscriptions
FROM public.subscriptions s
LEFT JOIN public.profiles p ON s.user_id = p.id
WHERE p.id IS NULL;

-- Find stock_analyses without profiles
SELECT COUNT(*) as orphaned_analyses
FROM public.stock_analyses sa
LEFT JOIN public.profiles p ON sa.user_id = p.id
WHERE p.id IS NULL AND sa.user_id IS NOT NULL;

-- Find usage_tracking without profiles
SELECT COUNT(*) as orphaned_usage
FROM public.usage_tracking ut
LEFT JOIN public.profiles p ON ut.user_id = p.id
WHERE p.id IS NULL;

-- Expected: All counts should be 0
```

### 2. Check for Duplicate Users

```sql
-- Check for duplicate clerk_user_id
SELECT clerk_user_id, COUNT(*) as count
FROM public.profiles
WHERE clerk_user_id IS NOT NULL
GROUP BY clerk_user_id
HAVING COUNT(*) > 1;

-- Expected: No results

-- Check for duplicate emails
SELECT email, COUNT(*) as count
FROM public.profiles
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- Expected: No results (or expected duplicates if allowed)
```

### 3. Verify Data Types

```sql
-- Ensure no UUID values remain in TEXT columns
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('id', 'user_id')
  AND data_type != 'text'
ORDER BY table_name, column_name;

-- Expected: No results (all should be text)
```

## Performance Checks

### 1. Check Index Usage

```sql
-- Check if indexes are being used
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'subscriptions', 'stock_analyses')
ORDER BY tablename, indexname;

-- Monitor over time to ensure indexes are used
```

### 2. Query Performance

```sql
-- Test query performance with new TEXT indexes
EXPLAIN ANALYZE
SELECT * FROM public.profiles WHERE id = 'user_2abc123def';

EXPLAIN ANALYZE
SELECT * FROM public.subscriptions WHERE user_id = 'user_2abc123def';

-- Check that indexes are being used (look for "Index Scan")
```

## Migration Status Report

Run this comprehensive check to generate a status report:

```sql
-- Migration status report
WITH type_check AS (
  SELECT
    table_name,
    column_name,
    data_type,
    CASE
      WHEN data_type = 'text' THEN '✓'
      ELSE '✗'
    END as status
  FROM information_schema.columns
  WHERE column_name IN ('id', 'user_id')
    AND table_schema = 'public'
),
clerk_columns AS (
  SELECT
    COUNT(*) as count
  FROM information_schema.columns
  WHERE table_name = 'profiles'
    AND column_name IN ('clerk_user_id', 'first_name', 'last_name', 'image_url')
),
policy_check AS (
  SELECT
    tablename,
    COUNT(*) as policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND policyname LIKE '%service role%'
  GROUP BY tablename
),
function_check AS (
  SELECT
    COUNT(*) as count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name LIKE '%clerk%'
),
trigger_check AS (
  SELECT
    COUNT(*) as count
  FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created'
)
SELECT
  'Data Type Migration' as check_category,
  'All user_id columns should be TEXT' as check_description,
  CASE
    WHEN (SELECT COUNT(*) FROM type_check WHERE status = '✗') = 0 THEN '✓ PASSED'
    ELSE '✗ FAILED'
  END as result
UNION ALL
SELECT
  'Clerk Columns',
  'Should have 4 new Clerk columns in profiles',
  CASE
    WHEN (SELECT count FROM clerk_columns) >= 4 THEN '✓ PASSED'
    ELSE '✗ FAILED'
  END
UNION ALL
SELECT
  'RLS Policies',
  'Should have service role policies',
  CASE
    WHEN (SELECT SUM(policy_count) FROM policy_check) >= 6 THEN '✓ PASSED'
    ELSE '✗ FAILED'
  END
UNION ALL
SELECT
  'Helper Functions',
  'Should have 3 Clerk helper functions',
  CASE
    WHEN (SELECT count FROM function_check) >= 3 THEN '✓ PASSED'
    ELSE '✗ FAILED'
  END
UNION ALL
SELECT
  'Auth Trigger',
  'Supabase Auth trigger should be removed',
  CASE
    WHEN (SELECT count FROM trigger_check) = 0 THEN '✓ PASSED'
    ELSE '✗ FAILED'
  END;
```

## Rollback Verification

If you need to rollback, verify with these queries:

```sql
-- After rollback, verify UUID types are restored
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name IN ('id', 'user_id')
  AND table_schema = 'public'
ORDER BY table_name;

-- Expected: All should be 'uuid'

-- Verify auth.users foreign key is restored
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'profiles'
  AND constraint_type = 'FOREIGN KEY';

-- Expected: profiles_id_fkey should exist

-- Verify Supabase Auth trigger is restored
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Expected: Should exist
```

## Notes

- Run verification queries after migration completes
- Test all functions in a development environment first
- Monitor application logs for any RLS policy issues
- Ensure service role key is properly configured in your application
- Keep this document for future reference and troubleshooting
