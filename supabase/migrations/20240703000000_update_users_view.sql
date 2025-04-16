-- Drop the existing users_view if it exists
DROP VIEW IF EXISTS users_view;

-- Create the users_view with email_confirmed_at field
CREATE OR REPLACE VIEW users_view AS
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data as user_metadata
FROM auth.users;

-- Update the get_users_with_roles function to include email_confirmed_at
CREATE OR REPLACE FUNCTION portfolio.get_users_with_roles() RETURNS TABLE (
  user_id UUID,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  roles JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    (u.raw_user_meta_data->>'name')::TEXT,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'name', r.name,
            'description', r.description
          )
        )
        FROM portfolio.user_roles ur
        JOIN portfolio.roles r ON ur.role_id = r.id
        WHERE ur.user_id = u.id
      ),
      '[]'::jsonb
    ) AS roles
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the get_user_with_roles function to include email_confirmed_at
CREATE OR REPLACE FUNCTION portfolio.get_user_with_roles(in_user_id UUID) RETURNS TABLE (
  user_id UUID,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  roles JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    (u.raw_user_meta_data->>'name')::TEXT,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'name', r.name,
            'description', r.description
          )
        )
        FROM portfolio.user_roles ur
        JOIN portfolio.roles r ON ur.role_id = r.id
        WHERE ur.user_id = u.id
      ),
      '[]'::jsonb
    ) AS roles
  FROM auth.users u
  WHERE u.id = in_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the search_users function to include email_confirmed_at
CREATE OR REPLACE FUNCTION portfolio.search_users(search_term TEXT) RETURNS TABLE (
  user_id UUID,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  roles JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    (u.raw_user_meta_data->>'name')::TEXT,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'name', r.name,
            'description', r.description
          )
        )
        FROM portfolio.user_roles ur
        JOIN portfolio.roles r ON ur.role_id = r.id
        WHERE ur.user_id = u.id
      ),
      '[]'::jsonb
    ) AS roles
  FROM auth.users u
  WHERE u.email ILIKE '%' || search_term || '%'
    OR (u.raw_user_meta_data->>'name') ILIKE '%' || search_term || '%'
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.get_users_with_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.get_user_with_roles(in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.search_users(TEXT) TO authenticated;

/*
 --------------------------------------------------------------------------------
 UPDATE USERS VIEW
 --------------------------------------------------------------------------------
 
 This migration updates the users_view and related functions to include the 
 email_confirmed_at field. This field is used to determine if a user's email
 has been confirmed.
 
 Changes:
 1. Updated the users_view to include the email_confirmed_at field
 2. Updated the get_users_with_roles function to include email_confirmed_at
 3. Updated the get_user_with_roles function to include email_confirmed_at
 4. Updated the search_users function to include email_confirmed_at
 
 --------------------------------------------------------------------------------
 */
