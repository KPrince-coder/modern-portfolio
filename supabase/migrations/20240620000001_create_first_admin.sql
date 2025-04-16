-- Create First Admin User Migration
-- This file contains a function to create the first admin user
-- Drop the function if it exists
DROP FUNCTION IF EXISTS portfolio.create_first_admin(TEXT, TEXT, TEXT);
-- Function to create the first admin user
CREATE OR REPLACE FUNCTION portfolio.create_first_admin(
    admin_email TEXT,
    admin_password TEXT,
    admin_name TEXT
  ) RETURNS JSONB AS $$
DECLARE admin_id UUID;
admin_role_id UUID;
result JSONB;
BEGIN -- Check if there are any users with admin role
IF EXISTS (
  SELECT 1
  FROM portfolio.user_roles ur
    JOIN portfolio.roles r ON ur.role_id = r.id
  WHERE r.name = 'admin'
) THEN RAISE EXCEPTION 'An admin user already exists. This function can only be used to create the first admin.';
END IF;
-- Get the admin role ID
SELECT id INTO admin_role_id
FROM portfolio.roles
WHERE name = 'admin';
IF admin_role_id IS NULL THEN RAISE EXCEPTION 'Admin role not found. Please run the user management migration first.';
END IF;
-- Create the admin user
admin_id := gen_random_uuid();
-- Create the user with confirmed email
BEGIN
INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at,
    encrypted_password,
    email_confirmed_at,
    -- Add this field to confirm the email
    confirmation_token,
    -- Set to empty as we're confirming directly
    is_sso_user -- Set to false as this is a password user
  )
VALUES (
    admin_id,
    admin_email,
    jsonb_build_object('name', admin_name),
    NOW(),
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    -- Set email_confirmed_at to current time
    '',
    -- Empty confirmation token
    FALSE -- Not an SSO user
  );
EXCEPTION
WHEN OTHERS THEN RAISE EXCEPTION 'Error creating user: %',
SQLERRM;
END;
-- Assign admin role
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (admin_id, admin_role_id);
-- Return the user data
result := jsonb_build_object(
  'id',
  admin_id,
  'email',
  admin_email,
  'user_metadata',
  jsonb_build_object('name', admin_name),
  'created_at',
  NOW(),
  'email_confirmed',
  TRUE
);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.create_first_admin TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.create_first_admin TO anon;
/*
 --------------------------------------------------------------------------------
 DOCUMENTATION
 --------------------------------------------------------------------------------
 
 This migration adds a function to create the first admin user in the system.
 This function can only be used once, when there are no admin users in the system.
 
 ## Function Parameters
 
 ### create_first_admin
 - admin_email: Admin's email address
 - admin_password: Admin's password
 - admin_name: Admin's display name
 
 ## Client Usage Example
 
 ```javascript
 // Create the first admin user
 const { data, error } = await supabase.rpc('create_first_admin', {
 admin_email: 'admin@example.com',
 admin_password: 'securepassword',
 admin_name: 'Admin User'
 });
 ```
 
 ## Security Considerations
 
 1. This function can only be used once, when there are no admin users in the system
 2. It is granted to both authenticated and anonymous users to allow initial setup
 3. After the first admin is created, only users with 'manage_users' permission can create more users
 
 ## Important Notes
 
 1. The function properly sets the encrypted password so the user can sign in immediately
 2. The email is automatically confirmed, so no email verification is needed
 3. The user is automatically assigned the 'admin' role with all permissions
 4. After creating the first admin, you can sign into the CMS using the email and password provided
 5. Additional admin users can be created by the first admin using the regular create_user function
 
 --------------------------------------------------------------------------------
 */