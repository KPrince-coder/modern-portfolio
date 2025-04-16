-- Create Admin Using Auth API Migration
-- This file contains a function to assign admin role to an existing user
-- Drop the function if it exists
DROP FUNCTION IF EXISTS portfolio.assign_admin_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS portfolio.assign_admin_role(in_user_id UUID) CASCADE;
-- Function to assign admin role to an existing user
CREATE OR REPLACE FUNCTION portfolio.assign_admin_role(in_user_id UUID) RETURNS JSONB AS $$
DECLARE admin_role_id UUID;
user_exists BOOLEAN;
result JSONB;
BEGIN -- Check if the user exists
SELECT EXISTS(
    SELECT 1
    FROM auth.users
    WHERE id = in_user_id
  ) INTO user_exists;
IF NOT user_exists THEN RAISE EXCEPTION 'User with ID % does not exist',
in_user_id;
END IF;
-- Get the admin role ID
SELECT id INTO admin_role_id
FROM portfolio.roles
WHERE name = 'admin';
IF admin_role_id IS NULL THEN RAISE EXCEPTION 'Admin role not found. Please run the user management migration first.';
END IF;
-- Check if the user already has the admin role
IF EXISTS (
  SELECT 1
  FROM portfolio.user_roles ur
  WHERE ur.user_id = in_user_id
    AND ur.role_id = admin_role_id
) THEN RETURN jsonb_build_object(
  'success',
  true,
  'message',
  format('User %s already has admin role', in_user_id),
  'user_id',
  in_user_id,
  'role_id',
  admin_role_id
);
END IF;
-- Assign admin role
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (in_user_id, admin_role_id);
-- Return success
result := jsonb_build_object(
  'success',
  true,
  'message',
  format('Admin role assigned to user %s', in_user_id),
  'user_id',
  in_user_id,
  'role_id',
  admin_role_id
);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.assign_admin_role(in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.assign_admin_role(in_user_id UUID) TO anon;
-- Create a view to help with user management
CREATE OR REPLACE VIEW portfolio.admin_users AS
SELECT u.id,
  u.email,
  u.raw_user_meta_data->>'name' AS name,
  u.created_at,
  u.last_sign_in_at,
  r.name AS role_name
FROM auth.users u
  JOIN portfolio.user_roles ur ON u.id = ur.user_id
  JOIN portfolio.roles r ON ur.role_id = r.id
WHERE r.name = 'admin';
-- Grant access to the view
GRANT SELECT ON portfolio.admin_users TO authenticated;
/*
 --------------------------------------------------------------------------------
 DOCUMENTATION
 --------------------------------------------------------------------------------
 
 This migration provides a function to assign the admin role to an existing user,
 which is part of the recommended approach for creating admin users.
 
 ## Complete Process to Create an Admin User
 
 1. First, create a user through the Supabase Auth API using one of these methods:
 
 a. Using the Supabase Dashboard:
 - Go to Authentication > Users
 - Click "Add User"
 - Enter the email and password
 - Check "Auto-confirm email" if available
 - Click "Create User"
 - Note the UUID of the created user
 
 b. Using the Supabase JavaScript client with service role key:
 ```javascript
 const { data, error } = await supabaseAdmin.auth.admin.createUser({
 email: 'admin@example.com',
 password: 'securepassword',
 email_confirm: true // This automatically confirms the email
 });
 const userId = data.user.id;
 ```
 
 2. After creating the user, assign the admin role using the function provided in this migration:
 
 ```sql
 SELECT portfolio.assign_admin_role('USER_UUID_HERE'::UUID); -- Replace with the actual UUID
 ```
 
 Or using JavaScript:
 ```javascript
 const { data, error } = await supabase.rpc('assign_admin_role', {
 in_user_id: 'USER_UUID_HERE' // Replace with the actual UUID
 });
 ```
 
 ## Function Parameters
 
 ### assign_admin_role
 - user_id: UUID of the user to assign the admin role to
 
 ## Example Usage
 
 ```sql
 -- Assign admin role to an existing user
 SELECT portfolio.assign_admin_role('74cf12f5-01fa-47e3-a0a2-9a989a2abb38'::UUID);
 
 -- Verify the user has the admin role
 SELECT * FROM portfolio.admin_users WHERE id = '74cf12f5-01fa-47e3-a0a2-9a989a2abb38';
 ```
 
 ## Important Notes
 
 1. This approach uses the Supabase Auth API to create the user, which ensures all required fields are properly set
 2. The email should be automatically confirmed for the user to sign in (use email_confirm: true)
 3. After assigning the admin role, the user can sign in and access all admin features
 4. This is the recommended approach for creating users that can sign in properly
 
 --------------------------------------------------------------------------------
 */