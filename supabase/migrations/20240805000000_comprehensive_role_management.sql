-- Comprehensive migration for role management
-- This migration combines all the necessary functionality for role management
-- and replaces the previous individual migration files.
-- Create a function to check user roles directly
CREATE OR REPLACE FUNCTION portfolio.check_user_roles(in_user_id UUID) RETURNS TABLE (
    user_id UUID,
    role_id UUID,
    role_name TEXT,
    role_description TEXT
  ) AS $$ BEGIN -- Log for debugging
  RAISE NOTICE 'Checking user roles for user %',
  in_user_id;
RETURN QUERY
SELECT ur.user_id,
  ur.role_id,
  r.name,
  r.description
FROM portfolio.user_roles ur
  JOIN portfolio.roles r ON ur.role_id = r.id
WHERE ur.user_id = in_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a public wrapper for the check_user_roles function
DROP FUNCTION IF EXISTS public.check_user_roles(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.check_user_roles(in_user_id UUID) RETURNS TABLE (
    user_id UUID,
    role_id UUID,
    role_name TEXT,
    role_description TEXT
  ) AS $$ BEGIN -- Call the actual function in the portfolio schema
  RETURN QUERY
SELECT *
FROM portfolio.check_user_roles(in_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.check_user_roles(in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_roles(in_user_id UUID) TO authenticated;
-- Add a comment explaining the function
COMMENT ON FUNCTION portfolio.check_user_roles(in_user_id UUID) IS 'Returns the roles for a user directly from the user_roles table.';
COMMENT ON FUNCTION public.check_user_roles(in_user_id UUID) IS 'Public wrapper for portfolio.check_user_roles to make it easier to call from the frontend.';
-- Create a function to assign any role to a user
CREATE OR REPLACE FUNCTION portfolio.assign_role(in_user_id UUID, in_role_id UUID) RETURNS JSONB AS $$
DECLARE result JSONB;
role_name TEXT;
BEGIN -- Log for debugging
RAISE NOTICE 'Assigning role % to user %',
in_role_id,
in_user_id;
-- Check if the role exists
SELECT name INTO role_name
FROM portfolio.roles
WHERE id = in_role_id;
IF role_name IS NULL THEN RAISE EXCEPTION 'Role % does not exist',
in_role_id;
END IF;
-- Check if the user exists
IF NOT EXISTS (
  SELECT 1
  FROM auth.users
  WHERE id = in_user_id
) THEN RAISE EXCEPTION 'User % does not exist',
in_user_id;
END IF;
-- Delete existing roles for this user (optional, remove if you want to keep existing roles)
DELETE FROM portfolio.user_roles
WHERE user_id = in_user_id;
-- Insert the role
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (in_user_id, in_role_id) ON CONFLICT (user_id, role_id) DO NOTHING;
-- Return success
result := jsonb_build_object(
  'success',
  true,
  'user_id',
  in_user_id,
  'role_id',
  in_role_id,
  'role_name',
  role_name
);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a public wrapper for the assign_role function
DROP FUNCTION IF EXISTS public.assign_role(UUID, UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.assign_role(in_user_id UUID, in_role_id UUID) RETURNS JSONB AS $$ BEGIN -- Call the actual function in the portfolio schema
  RETURN portfolio.assign_role(in_user_id, in_role_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.assign_role(in_user_id UUID, in_role_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_role(in_user_id UUID, in_role_id UUID) TO authenticated;
-- Add a comment explaining the function
COMMENT ON FUNCTION portfolio.assign_role(in_user_id UUID, in_role_id UUID) IS 'Assigns a role to a user.';
COMMENT ON FUNCTION public.assign_role(in_user_id UUID, in_role_id UUID) IS 'Public wrapper for portfolio.assign_role to make it easier to call from the frontend.';
-- Create a function to debug user roles
CREATE OR REPLACE FUNCTION portfolio.debug_user_roles(in_user_id UUID) RETURNS JSONB AS $$
DECLARE result JSONB;
user_record RECORD;
role_records JSONB;
raw_roles_count INTEGER;
BEGIN -- Get user information
SELECT id,
  email,
  raw_user_meta_data INTO user_record
FROM auth.users
WHERE id = in_user_id;
-- Log for debugging
RAISE NOTICE 'Debugging user roles for user % (%)',
in_user_id,
user_record.email;
-- Get raw user roles count for debugging
SELECT COUNT(*) INTO raw_roles_count
FROM portfolio.user_roles ur
  JOIN portfolio.roles r ON ur.role_id = r.id
WHERE ur.user_id = in_user_id;
RAISE NOTICE 'Raw roles count: %',
raw_roles_count;
-- Get user roles
SELECT jsonb_agg(
    jsonb_build_object(
      'role_id',
      r.id,
      'role_name',
      r.name,
      'role_description',
      r.description
    )
  ) INTO role_records
FROM portfolio.user_roles ur
  JOIN portfolio.roles r ON ur.role_id = r.id
WHERE ur.user_id = in_user_id;
-- Build result
result := jsonb_build_object(
  'user_id',
  user_record.id,
  'email',
  user_record.email,
  'name',
  user_record.raw_user_meta_data->>'name',
  'roles',
  COALESCE(role_records, '[]'::jsonb),
  'raw_roles_count',
  raw_roles_count
);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a public wrapper for the debug_user_roles function
DROP FUNCTION IF EXISTS public.debug_user_roles(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.debug_user_roles(in_user_id UUID) RETURNS JSONB AS $$ BEGIN -- Call the actual function in the portfolio schema
  RETURN portfolio.debug_user_roles(in_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.debug_user_roles(in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_user_roles(in_user_id UUID) TO authenticated;
-- Add a comment explaining the function
COMMENT ON FUNCTION portfolio.debug_user_roles(in_user_id UUID) IS 'Returns detailed information about a user and their roles for debugging purposes.';
COMMENT ON FUNCTION public.debug_user_roles(in_user_id UUID) IS 'Public wrapper for portfolio.debug_user_roles to make it easier to call from the frontend.';
-- Update the get_users_with_roles function to be VOLATILE to avoid caching
DROP FUNCTION IF EXISTS portfolio.get_users_with_roles();
CREATE OR REPLACE FUNCTION portfolio.get_users_with_roles() RETURNS TABLE (
    user_id UUID,
    email VARCHAR,
    name TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    roles JSONB
  ) AS $$ BEGIN -- Log for debugging
  RAISE NOTICE 'Executing get_users_with_roles function';
RETURN QUERY
SELECT u.id,
  u.email,
  (u.raw_user_meta_data->>'name')::TEXT,
  u.created_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  COALESCE(
    (
      SELECT jsonb_agg(
          jsonb_build_object(
            'id',
            r.id,
            'name',
            r.name,
            'description',
            r.description
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
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;
-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION portfolio.get_users_with_roles() TO authenticated;
-- Add a comment explaining the function
COMMENT ON FUNCTION portfolio.get_users_with_roles() IS 'Returns all users with their roles and email confirmation status. VOLATILE to avoid caching.';
-- Update the public wrapper for the get_users_with_roles function
DROP FUNCTION IF EXISTS public.get_users_with_roles() CASCADE;
CREATE OR REPLACE FUNCTION public.get_users_with_roles() RETURNS TABLE (
    user_id UUID,
    email VARCHAR,
    name TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    roles JSONB
  ) AS $$ BEGIN -- Call the actual function in the portfolio schema
  RETURN QUERY
SELECT *
FROM portfolio.get_users_with_roles();
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;
-- Add a comment explaining the function
COMMENT ON FUNCTION public.get_users_with_roles() IS 'Public wrapper for portfolio.get_users_with_roles to make it easier to call from the frontend.';
-- Fix the get_user_with_roles function
DROP FUNCTION IF EXISTS portfolio.get_user_with_roles(UUID);
CREATE OR REPLACE FUNCTION portfolio.get_user_with_roles(in_user_id UUID) RETURNS TABLE (
    user_id UUID,
    email VARCHAR,
    name TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    roles JSONB
  ) AS $$ BEGIN -- Log for debugging
  RAISE NOTICE 'Executing get_user_with_roles function for user %',
  in_user_id;
RETURN QUERY
SELECT u.id,
  u.email,
  (u.raw_user_meta_data->>'name')::TEXT,
  u.created_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  COALESCE(
    (
      SELECT jsonb_agg(
          jsonb_build_object(
            'id',
            r.id,
            'name',
            r.name,
            'description',
            r.description
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
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;
-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION portfolio.get_user_with_roles(UUID) TO authenticated;
-- Add a comment explaining the function
COMMENT ON FUNCTION portfolio.get_user_with_roles(UUID) IS 'Returns a specific user with their roles and email confirmation status. VOLATILE to avoid caching.';
-- Update the public wrapper for the get_user_with_roles function
DROP FUNCTION IF EXISTS public.get_user_with_roles(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_with_roles(in_user_id UUID) RETURNS TABLE (
    user_id UUID,
    email VARCHAR,
    name TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    roles JSONB
  ) AS $$ BEGIN -- Call the actual function in the portfolio schema
  RETURN QUERY
SELECT *
FROM portfolio.get_user_with_roles(in_user_id);
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_with_roles(in_user_id UUID) TO authenticated;
-- Add a comment explaining the function
COMMENT ON FUNCTION public.get_user_with_roles(in_user_id UUID) IS 'Public wrapper for portfolio.get_user_with_roles to make it easier to call from the frontend.';
-- Create a function to assign admin role to a user
CREATE OR REPLACE FUNCTION portfolio.assign_admin_role(in_user_id UUID) RETURNS JSONB AS $$
DECLARE admin_role_id UUID;
result JSONB;
BEGIN -- Get the admin role ID
SELECT id INTO admin_role_id
FROM portfolio.roles
WHERE name = 'admin';
-- If admin role doesn't exist, create it
IF admin_role_id IS NULL THEN
INSERT INTO portfolio.roles (name, description, permissions)
VALUES (
    'admin',
    'Administrator with full access to all features',
    '["manage_users", "manage_roles", "manage_content", "view_analytics", "manage_settings"]'::jsonb
  )
RETURNING id INTO admin_role_id;
END IF;
-- Assign admin role to the user
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (in_user_id, admin_role_id) ON CONFLICT (user_id, role_id) DO NOTHING;
-- Return success
result := jsonb_build_object(
  'success',
  true,
  'user_id',
  in_user_id,
  'role_id',
  admin_role_id
);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a public wrapper for the assign_admin_role function
DROP FUNCTION IF EXISTS public.assign_admin_role(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.assign_admin_role(in_user_id UUID) RETURNS JSONB AS $$ BEGIN -- Call the actual function in the portfolio schema
  RETURN portfolio.assign_admin_role(in_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.assign_admin_role(in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_admin_role(in_user_id UUID) TO authenticated;
-- Add a comment explaining the function
COMMENT ON FUNCTION portfolio.assign_admin_role(in_user_id UUID) IS 'Assigns the admin role to a user.';
COMMENT ON FUNCTION public.assign_admin_role(in_user_id UUID) IS 'Public wrapper for portfolio.assign_admin_role to make it easier to call from the frontend.';
-- Fix the audit logs policy
DROP POLICY IF EXISTS insert_audit_logs ON portfolio.audit_logs;
CREATE POLICY insert_audit_logs ON portfolio.audit_logs FOR
INSERT TO authenticated WITH CHECK (true);
-- Add a comment explaining the policy
COMMENT ON POLICY insert_audit_logs ON portfolio.audit_logs IS 'Allows authenticated users to insert audit logs';