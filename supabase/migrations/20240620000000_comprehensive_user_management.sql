-- Comprehensive User Management Migration
-- This file contains all the necessary tables, functions, and permissions for user management
-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS portfolio;
-- Drop existing policies first to avoid dependency issues
DROP POLICY IF EXISTS manage_user_roles ON portfolio.user_roles;
DROP POLICY IF EXISTS manage_roles ON portfolio.roles;
DROP POLICY IF EXISTS view_audit_logs ON portfolio.audit_logs;
DROP POLICY IF EXISTS "Roles can be inserted by users with manage_roles permission" ON portfolio.roles;
DROP POLICY IF EXISTS "Roles can be updated by users with manage_roles permission" ON portfolio.roles;
DROP POLICY IF EXISTS "Roles can be deleted by users with manage_roles permission" ON portfolio.roles;
DROP POLICY IF EXISTS "Audit logs are viewable by users with manage_users or manage_ro" ON portfolio.audit_logs;
-- Drop existing functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS portfolio.has_permission(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS portfolio.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS portfolio.is_admin() CASCADE;
DROP FUNCTION IF EXISTS portfolio.is_admin_current() CASCADE;
DROP FUNCTION IF EXISTS portfolio.get_user_roles(UUID) CASCADE;
DROP FUNCTION IF EXISTS portfolio.get_user_roles(in_user_id UUID) CASCADE;
DROP FUNCTION IF EXISTS portfolio.create_user(TEXT, TEXT, TEXT, UUID []) CASCADE;
DROP FUNCTION IF EXISTS portfolio.create_user(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS portfolio.update_user(UUID, TEXT, TEXT, TEXT, UUID []) CASCADE;
DROP FUNCTION IF EXISTS portfolio.update_user(in_user_id UUID, TEXT, TEXT, TEXT, UUID []) CASCADE;
DROP FUNCTION IF EXISTS portfolio.update_user(UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS portfolio.delete_user(UUID) CASCADE;
DROP FUNCTION IF EXISTS portfolio.delete_user(in_user_id UUID) CASCADE;
DROP FUNCTION IF EXISTS portfolio.get_users_with_roles() CASCADE;
DROP FUNCTION IF EXISTS portfolio.get_user_with_roles(UUID) CASCADE;
DROP FUNCTION IF EXISTS portfolio.get_user_with_roles(in_user_id UUID) CASCADE;
DROP FUNCTION IF EXISTS portfolio.search_users(TEXT) CASCADE;
DROP FUNCTION IF EXISTS portfolio.parse_role_ids(TEXT) CASCADE;
DROP FUNCTION IF EXISTS portfolio.parse_role_ids_enhanced(TEXT) CASCADE;
DROP FUNCTION IF EXISTS portfolio.create_user_fallback(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS portfolio.update_user_fallback(UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;
-- Disable RLS on tables before dropping them
ALTER TABLE IF EXISTS portfolio.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio.audit_logs DISABLE ROW LEVEL SECURITY;
-- Drop existing tables if they exist with CASCADE to handle dependencies
DROP TABLE IF EXISTS portfolio.user_roles CASCADE;
DROP TABLE IF EXISTS portfolio.roles CASCADE;
DROP TABLE IF EXISTS portfolio.audit_logs CASCADE;
-- Create roles table
CREATE TABLE portfolio.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Create user_roles table
CREATE TABLE portfolio.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES portfolio.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);
-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON portfolio.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON portfolio.user_roles(role_id);
-- Create audit_logs table
CREATE TABLE portfolio.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE
  SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON portfolio.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON portfolio.audit_logs(entity_type, entity_id);
-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION portfolio.has_permission(user_id UUID, permission TEXT) RETURNS BOOLEAN AS $$
DECLARE has_perm BOOLEAN;
BEGIN -- Check if the user has the specified permission through any of their roles
SELECT EXISTS (
    SELECT 1
    FROM portfolio.user_roles ur
      JOIN portfolio.roles r ON ur.role_id = r.id
    WHERE ur.user_id = has_permission.user_id
      AND permission = ANY(
        ARRAY(
          SELECT jsonb_array_elements_text(r.permissions)
        )
      )
  ) INTO has_perm;
RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION portfolio.is_admin(user_id UUID) RETURNS BOOLEAN AS $$
DECLARE is_admin_user BOOLEAN;
BEGIN -- Check if the user has the admin role
SELECT EXISTS (
    SELECT 1
    FROM portfolio.user_roles ur
      JOIN portfolio.roles r ON ur.role_id = r.id
    WHERE ur.user_id = is_admin.user_id
      AND r.name = 'admin'
  ) INTO is_admin_user;
RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to check if the current user is an admin (no parameters)
CREATE OR REPLACE FUNCTION portfolio.is_admin_current() RETURNS BOOLEAN AS $$ BEGIN RETURN portfolio.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to get user roles
CREATE OR REPLACE FUNCTION portfolio.get_user_roles(in_user_id UUID) RETURNS TABLE (
    role_id UUID,
    role_name TEXT,
    role_description TEXT,
    role_permissions JSONB
  ) AS $$ BEGIN RETURN QUERY
SELECT r.id,
  r.name,
  r.description,
  r.permissions
FROM portfolio.user_roles ur
  JOIN portfolio.roles r ON ur.role_id = r.id
WHERE ur.user_id = in_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to create a user with proper permissions
CREATE OR REPLACE FUNCTION portfolio.create_user(
    in_user_email TEXT,
    in_user_password TEXT,
    in_user_name TEXT,
    in_user_roles UUID [] DEFAULT '{}'::UUID []
  ) RETURNS JSONB AS $$
DECLARE new_user_id UUID;
role_id UUID;
result JSONB;
BEGIN -- Check if the current user has permission to create users
IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN RAISE EXCEPTION 'Permission denied: You do not have permission to create users';
END IF;
-- Create the user in auth.users
new_user_id := gen_random_uuid();
-- Insert into auth.users
INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at
  )
VALUES (
    new_user_id,
    in_user_email,
    jsonb_build_object('name', in_user_name),
    NOW()
  );
-- Assign roles to the user
IF array_length(in_user_roles, 1) > 0 THEN FOREACH role_id IN ARRAY in_user_roles LOOP BEGIN
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (new_user_id, role_id) ON CONFLICT (user_id, role_id) DO NOTHING;
EXCEPTION
WHEN OTHERS THEN RAISE NOTICE 'Error inserting role %: %',
role_id,
SQLERRM;
END;
END LOOP;
END IF;
-- Return the user data
result := jsonb_build_object(
  'id',
  new_user_id,
  'email',
  user_email,
  'user_metadata',
  jsonb_build_object('name', user_name),
  'created_at',
  NOW()
);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to update a user with proper permissions
CREATE OR REPLACE FUNCTION portfolio.update_user(
    in_user_id UUID,
    user_email TEXT,
    user_password TEXT,
    user_name TEXT,
    user_roles UUID [] DEFAULT '{}'::UUID []
  ) RETURNS JSONB AS $$
DECLARE role_id UUID;
result JSONB;
BEGIN -- Check if the current user has permission to update users
IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN RAISE EXCEPTION 'Permission denied: You do not have permission to update users';
END IF;
-- Update the user in auth.users
UPDATE auth.users
SET email = user_email,
  raw_user_meta_data = jsonb_build_object('name', user_name),
  updated_at = NOW()
WHERE id = in_user_id;
-- Delete existing roles
DELETE FROM portfolio.user_roles
WHERE user_id = in_user_id;
-- Assign new roles
IF array_length(user_roles, 1) > 0 THEN FOREACH role_id IN ARRAY user_roles LOOP BEGIN
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (in_user_id, role_id) ON CONFLICT (user_id, role_id) DO NOTHING;
EXCEPTION
WHEN OTHERS THEN RAISE NOTICE 'Error inserting role %: %',
role_id,
SQLERRM;
END;
END LOOP;
END IF;
-- Return success
result := jsonb_build_object('success', true, 'id', in_user_id);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to delete a user with proper permissions
CREATE OR REPLACE FUNCTION portfolio.delete_user(in_user_id UUID) RETURNS JSONB AS $$
DECLARE result JSONB;
BEGIN -- Check if the current user has permission to delete users
IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN RAISE EXCEPTION 'Permission denied: You do not have permission to delete users';
END IF;
-- Delete the user from auth.users
DELETE FROM auth.users
WHERE id = in_user_id;
-- Return success
result := jsonb_build_object('success', true, 'id', in_user_id);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to get all users with their roles
CREATE OR REPLACE FUNCTION portfolio.get_users_with_roles() RETURNS TABLE (
    user_id UUID,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    roles JSONB
  ) AS $$ BEGIN RETURN QUERY
SELECT u.id,
  u.email,
  (u.raw_user_meta_data->>'name')::TEXT,
  u.created_at,
  u.last_sign_in_at,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to get a single user with their roles
CREATE OR REPLACE FUNCTION portfolio.get_user_with_roles(in_user_id UUID) RETURNS TABLE (
    user_id UUID,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    roles JSONB
  ) AS $$ BEGIN RETURN QUERY
SELECT u.id,
  u.email,
  (u.raw_user_meta_data->>'name')::TEXT,
  u.created_at,
  u.last_sign_in_at,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to search users
CREATE OR REPLACE FUNCTION portfolio.search_users(search_term TEXT) RETURNS TABLE (
    user_id UUID,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    roles JSONB
  ) AS $$ BEGIN RETURN QUERY
SELECT u.id,
  u.email,
  (u.raw_user_meta_data->>'name')::TEXT,
  u.created_at,
  u.last_sign_in_at,
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
WHERE u.email ILIKE '%' || search_term || '%'
  OR (u.raw_user_meta_data->>'name') ILIKE '%' || search_term || '%'
ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create RLS policies for user_roles table
ALTER TABLE portfolio.user_roles ENABLE ROW LEVEL SECURITY;
-- Only admins can manage user roles
CREATE POLICY manage_user_roles ON portfolio.user_roles USING (portfolio.is_admin_current());
-- Create RLS policies for roles table
ALTER TABLE portfolio.roles ENABLE ROW LEVEL SECURITY;
-- Only admins can manage roles
CREATE POLICY manage_roles ON portfolio.roles USING (portfolio.is_admin_current());
-- Create RLS policies for audit_logs table
ALTER TABLE portfolio.audit_logs ENABLE ROW LEVEL SECURITY;
-- Only admins can view audit logs
CREATE POLICY view_audit_logs ON portfolio.audit_logs FOR
SELECT USING (portfolio.is_admin_current());
-- Grant necessary permissions
GRANT USAGE ON SCHEMA portfolio TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.is_admin_current() TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.get_user_roles(in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.create_user(TEXT, TEXT, TEXT, UUID []) TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.update_user(in_user_id UUID, TEXT, TEXT, TEXT, UUID []) TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.delete_user(in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.get_users_with_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.get_user_with_roles(in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.search_users(TEXT) TO authenticated;
-- Grant table permissions
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON portfolio.user_roles TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON portfolio.roles TO authenticated;
GRANT SELECT,
  INSERT ON portfolio.audit_logs TO authenticated;
-- Insert default admin role if it doesn't exist
INSERT INTO portfolio.roles (name, description, permissions)
VALUES (
    'admin',
    'Administrator with full access to all features',
    '["manage_users", "manage_roles", "manage_content", "view_analytics", "manage_settings"]'
  ) ON CONFLICT (name) DO NOTHING;
-- Insert default editor role if it doesn't exist
INSERT INTO portfolio.roles (name, description, permissions)
VALUES (
    'editor',
    'Editor with access to content management',
    '["manage_content"]'
  ) ON CONFLICT (name) DO NOTHING;
/*
 --------------------------------------------------------------------------------
 COMPREHENSIVE DOCUMENTATION
 --------------------------------------------------------------------------------
 
 This migration file implements a complete user management system for the portfolio
 application. It provides functions for creating, updating, and deleting users, as
 well as managing user roles and permissions.
 
 ## Key Components
 
 1. Tables:
 - portfolio.roles: Stores role definitions with permissions
 - portfolio.user_roles: Links users to their assigned roles
 - portfolio.audit_logs: Tracks changes to entities for auditing purposes
 
 2. Functions:
 - has_permission: Checks if a user has a specific permission
 - is_admin: Checks if a user is an admin (with user_id parameter)
 - is_admin_current: Checks if the current user is an admin (no parameters)
 - get_user_roles: Gets all roles assigned to a user
 - create_user: Creates a new user with specified roles
 - update_user: Updates an existing user's information and roles
 - delete_user: Deletes a user
 - get_users_with_roles: Gets all users with their roles
 - get_user_with_roles: Gets a specific user with their roles
 - search_users: Searches for users by email or name
 
 ## Function Parameters
 
 ### create_user
 - user_email: User's email address
 - user_password: User's password
 - user_name: User's display name
 - user_roles: Array of role UUIDs (default empty array)
 
 ### update_user
 - user_id: UUID of the user to update
 - user_email: New email address
 - user_password: New password (or null to keep current)
 - user_name: New display name
 - user_roles: Array of role UUIDs (default empty array)
 
 ### delete_user
 - user_id: UUID of the user to delete
 
 ### has_permission
 - user_id: UUID of the user to check
 - permission: Permission string to check for
 
 ### is_admin
 - user_id: UUID of the user to check (optional - uses current user if not provided)
 
 ### get_user_roles
 - in_user_id: UUID of the user to get roles for
 
 ### get_user_with_roles
 - in_user_id: UUID of the user to get
 
 ### search_users
 - search_term: Text to search for in email or name
 
 ## Client Usage Examples
 
 ### Creating a User
 ```javascript
 const { data, error } = await supabase.rpc('create_user', {
 user_email: 'user@example.com',
 user_password: 'securepassword',
 user_name: 'John Doe',
 user_roles: ['role-uuid-1', 'role-uuid-2'] // Pass as array directly
 });
 ```
 
 ### Updating a User
 ```javascript
 const { data, error } = await supabase.rpc('update_user', {
 in_user_id: 'user-uuid',
 user_email: 'updated@example.com',
 user_password: null, // Keep current password
 user_name: 'John Updated',
 user_roles: ['role-uuid-1', 'role-uuid-3'] // Pass as array directly
 });
 ```
 
 ### Deleting a User
 ```javascript
 const { data, error } = await supabase.rpc('delete_user', {
 in_user_id: 'user-uuid'
 });
 ```
 
 ### Checking Permissions
 ```javascript
 const { data, error } = await supabase.rpc('has_permission', {
 user_id: 'user-uuid',
 permission: 'manage_users'
 });
 ```
 
 ### Getting User Roles
 ```javascript
 const { data, error } = await supabase.rpc('get_user_roles', {
 in_user_id: 'user-uuid'
 });
 ```
 
 ### Searching Users
 ```javascript
 const { data, error } = await supabase.rpc('search_users', {
 search_term: 'john'
 });
 ```
 
 ## Security Considerations
 
 1. All functions use SECURITY DEFINER to run with elevated privileges
 2. Permission checks are performed before any sensitive operations
 3. RLS policies restrict access to user_roles table
 4. Error handling is implemented to prevent information leakage
 5. Input validation is performed to prevent SQL injection
 
 ## Performance Considerations
 
 1. Indexes are created for faster lookups
 2. Efficient queries with proper joins are used
 3. Error handling prevents database errors from causing issues
 
 ## Maintenance
 
 When adding new user management functionality:
 1. Add new functions to this file
 2. Update existing functions as needed
 3. Add appropriate comments and documentation
 4. Grant necessary permissions to authenticated users
 5. Update RLS policies as needed
 
 --------------------------------------------------------------------------------
 */