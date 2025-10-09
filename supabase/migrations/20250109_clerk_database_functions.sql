-- Clerk Database Functions
-- Creates Postgres functions for handling Clerk webhook events

-- Function to upsert (insert or update) user from Clerk webhook
CREATE OR REPLACE FUNCTION upsert_user_from_clerk(
  p_clerk_id TEXT,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_image_url TEXT,
  p_username TEXT,
  p_external_id TEXT
) RETURNS void AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Construct full name from first and last name
  v_full_name := TRIM(CONCAT(p_first_name, ' ', p_last_name));
  IF v_full_name = '' THEN
    v_full_name := NULL;
  END IF;

  -- Insert or update user profile
  INSERT INTO profiles (
    id,
    email,
    full_name,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    p_clerk_id,
    p_email,
    v_full_name,
    p_image_url,
    NOW(),
    NOW()
  )
  ON CONFLICT (id)
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

  -- Log the operation
  RAISE NOTICE 'Upserted user: %', p_clerk_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete user from Clerk webhook
CREATE OR REPLACE FUNCTION delete_user_from_clerk(
  p_clerk_id TEXT
) RETURNS void AS $$
BEGIN
  -- Delete user profile (cascades to related records)
  DELETE FROM profiles WHERE id = p_clerk_id;

  -- Log the operation
  RAISE NOTICE 'Deleted user: %', p_clerk_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION upsert_user_from_clerk TO service_role;
GRANT EXECUTE ON FUNCTION delete_user_from_clerk TO service_role;

-- Add comments for documentation
COMMENT ON FUNCTION upsert_user_from_clerk IS 'Creates or updates a user profile from Clerk webhook data';
COMMENT ON FUNCTION delete_user_from_clerk IS 'Deletes a user profile and related data when deleted in Clerk';
