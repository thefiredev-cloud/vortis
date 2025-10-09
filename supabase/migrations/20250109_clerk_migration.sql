-- Clerk Migration: Update profiles table for Clerk authentication
-- This migration modifies the profiles table to work with Clerk user IDs

-- Step 1: Modify the profiles table to accept Clerk user IDs (string format)
-- Clerk uses string IDs like "user_2abc123xyz", not UUIDs

ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;

-- Step 2: Remove Supabase auth trigger if it exists
-- We no longer use Supabase Auth, only Clerk
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Update RLS policies to use Clerk user IDs
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies
-- Note: With Clerk, we rely on application-level auth checks
-- These policies are more permissive since Clerk handles auth
CREATE POLICY "Enable read access for authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for service role"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Enable update access for service role"
  ON profiles FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Enable delete access for service role"
  ON profiles FOR DELETE
  TO service_role
  USING (true);

-- Step 4: Add index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Step 5: Update subscriptions table foreign key (if it exists)
-- This ensures subscriptions still link to profiles correctly
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'subscriptions'
  ) THEN
    -- Drop existing foreign key
    ALTER TABLE subscriptions
      DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

    -- Modify user_id column to TEXT
    ALTER TABLE subscriptions
      ALTER COLUMN user_id TYPE TEXT;

    -- Add new foreign key
    ALTER TABLE subscriptions
      ADD CONSTRAINT subscriptions_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Step 6: Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles synced from Clerk via webhooks';
COMMENT ON COLUMN profiles.id IS 'Clerk user ID (e.g., user_2abc123xyz)';
COMMENT ON COLUMN profiles.email IS 'User email from Clerk';
COMMENT ON COLUMN profiles.full_name IS 'Full name from Clerk (first_name + last_name)';
COMMENT ON COLUMN profiles.avatar_url IS 'Profile image URL from Clerk';

-- Migration complete
-- Next steps:
-- 1. Deploy this migration to Supabase
-- 2. Set up Clerk webhook at: /api/webhooks/clerk
-- 3. Test user creation, update, and deletion flows
