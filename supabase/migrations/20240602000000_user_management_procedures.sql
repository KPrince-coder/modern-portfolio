-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS portfolio.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS portfolio.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES portfolio.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS portfolio.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE
  SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create default roles if they don't exist
INSERT INTO portfolio.roles (name, description, permissions)
VALUES (
    'admin',
    'Full access to all features',
    '["create_posts","edit_posts","delete_posts","manage_comments","manage_users","manage_roles","manage_media","manage_settings","view_analytics"]'::JSONB
  ) ON CONFLICT (name) DO NOTHING;
INSERT INTO portfolio.roles (name, description, permissions)
VALUES (
    'content_editor',
    'Can create and edit content',
    '["create_posts","edit_posts","manage_comments","manage_media","view_analytics"]'::JSONB
  ) ON CONFLICT (name) DO NOTHING;
INSERT INTO portfolio.roles (name, description, permissions)
VALUES (
    'viewer',
    'Read-only access',
    '["view_analytics"]'::JSONB
  ) ON CONFLICT (name) DO NOTHING;
-- Enable RLS on roles table
ALTER TABLE portfolio.roles ENABLE ROW LEVEL SECURITY;
-- Drop existing RLS policies for roles table if they exist
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON portfolio.roles;
DROP POLICY IF EXISTS "Roles can be inserted by users with manage_roles permission" ON portfolio.roles;
DROP POLICY IF EXISTS "Roles can be updated by users with manage_roles permission" ON portfolio.roles;
DROP POLICY IF EXISTS "Roles can be deleted by users with manage_roles permission" ON portfolio.roles;
-- Create RLS policies for roles table
CREATE POLICY "Roles are viewable by authenticated users" ON portfolio.roles FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Roles can be inserted by users with manage_roles permission" ON portfolio.roles FOR
INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM portfolio.user_roles ur
        JOIN portfolio.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND 'manage_roles' = ANY(
          ARRAY(
            SELECT jsonb_array_elements_text(r.permissions)
          )
        )
    )
  );
CREATE POLICY "Roles can be updated by users with manage_roles permission" ON portfolio.roles FOR
UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM portfolio.user_roles ur
        JOIN portfolio.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND 'manage_roles' = ANY(
          ARRAY(
            SELECT jsonb_array_elements_text(r.permissions)
          )
        )
    )
  );
CREATE POLICY "Roles can be deleted by users with manage_roles permission" ON portfolio.roles FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM portfolio.user_roles ur
      JOIN portfolio.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND 'manage_roles' = ANY(
        ARRAY(
          SELECT jsonb_array_elements_text(r.permissions)
        )
      )
  )
);
-- Enable RLS on user_roles table
ALTER TABLE portfolio.user_roles ENABLE ROW LEVEL SECURITY;
-- Drop existing RLS policies for user_roles table if they exist
DROP POLICY IF EXISTS "User roles are viewable by authenticated users" ON portfolio.user_roles;
DROP POLICY IF EXISTS "User roles can be inserted by users with manage_users permission" ON portfolio.user_roles;
DROP POLICY IF EXISTS "User roles can be deleted by users with manage_users permission" ON portfolio.user_roles;
-- Create RLS policies for user_roles table
CREATE POLICY "User roles are viewable by authenticated users" ON portfolio.user_roles FOR
SELECT TO authenticated USING (true);
CREATE POLICY "User roles can be inserted by users with manage_users permission" ON portfolio.user_roles FOR
INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM portfolio.user_roles ur
        JOIN portfolio.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND 'manage_users' = ANY(
          ARRAY(
            SELECT jsonb_array_elements_text(r.permissions)
          )
        )
    )
  );
CREATE POLICY "User roles can be deleted by users with manage_users permission" ON portfolio.user_roles FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM portfolio.user_roles ur
      JOIN portfolio.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND 'manage_users' = ANY(
        ARRAY(
          SELECT jsonb_array_elements_text(r.permissions)
        )
      )
  )
);
-- Enable RLS on audit_logs table
ALTER TABLE portfolio.audit_logs ENABLE ROW LEVEL SECURITY;
-- Drop existing RLS policies for audit_logs table if they exist
DROP POLICY IF EXISTS "Audit logs are viewable by users with manage_users or manage_roles permission" ON portfolio.audit_logs;
DROP POLICY IF EXISTS "Audit logs can be inserted by authenticated users" ON portfolio.audit_logs;
-- Create RLS policies for audit_logs table
CREATE POLICY "Audit logs are viewable by users with manage_users or manage_roles permission" ON portfolio.audit_logs FOR
SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM portfolio.user_roles ur
        JOIN portfolio.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND (
          'manage_users' = ANY(
            ARRAY(
              SELECT jsonb_array_elements_text(r.permissions)
            )
          )
          OR 'manage_roles' = ANY(
            ARRAY(
              SELECT jsonb_array_elements_text(r.permissions)
            )
          )
        )
    )
  );
CREATE POLICY "Audit logs can be inserted by authenticated users" ON portfolio.audit_logs FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Create function to assign admin role to the first user
CREATE OR REPLACE FUNCTION portfolio.assign_admin_role_to_first_user() RETURNS TRIGGER AS $$
DECLARE user_count INTEGER;
admin_role_id UUID;
BEGIN -- Count existing users
SELECT COUNT(*) INTO user_count
FROM auth.users;
-- If this is the first user, assign admin role
IF user_count = 1 THEN -- Get admin role ID
SELECT id INTO admin_role_id
FROM portfolio.roles
WHERE name = 'admin';
-- Insert user_role
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (NEW.id, admin_role_id);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create trigger to assign admin role to the first user
DROP TRIGGER IF EXISTS assign_admin_role_trigger ON auth.users;
CREATE TRIGGER assign_admin_role_trigger
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION portfolio.assign_admin_role_to_first_user();
-- Create function to check if user has a specific permission
CREATE OR REPLACE FUNCTION portfolio.has_permission(user_id UUID, permission TEXT) RETURNS BOOLEAN AS $$
DECLARE has_perm BOOLEAN;
BEGIN
SELECT EXISTS (
    SELECT 1
    FROM portfolio.user_roles ur
      JOIN portfolio.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id
      AND permission = ANY(
        ARRAY(
          SELECT jsonb_array_elements_text(r.permissions)
        )
      )
  ) INTO has_perm;
RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create function to check if user is an admin
CREATE OR REPLACE FUNCTION portfolio.is_admin(user_id UUID) RETURNS BOOLEAN AS $$
DECLARE is_admin_user BOOLEAN;
BEGIN
SELECT EXISTS (
    SELECT 1
    FROM portfolio.user_roles ur
      JOIN portfolio.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id
      AND r.name = 'admin'
  ) INTO is_admin_user;
RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create function to get user roles
CREATE OR REPLACE FUNCTION portfolio.get_user_roles(user_id UUID) RETURNS TABLE (
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
WHERE ur.user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a function to create a user with proper permissions
CREATE OR REPLACE FUNCTION portfolio.create_user(
    user_email TEXT,
    user_password TEXT,
    user_name TEXT,
    user_roles UUID []
  ) RETURNS JSONB AS $$
DECLARE new_user_id UUID;
role_id UUID;
result JSONB;
BEGIN -- Check if the current user has permission to create users
IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN RAISE EXCEPTION 'Permission denied: You do not have permission to create users';
END IF;
-- Create the user in auth.users (placeholder for Supabase integration)
new_user_id := uuid_generate_v4();
-- Insert into auth.users (simplified for demonstration; use Supabase auth in production)
INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at
  )
VALUES (
    new_user_id,
    user_email,
    jsonb_build_object('name', user_name),
    NOW()
  );
-- Assign roles to the user
FOREACH role_id IN ARRAY user_roles LOOP
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (new_user_id, role_id) ON CONFLICT (user_id, role_id) DO NOTHING;
END LOOP;
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
-- Create a function to update a user with proper permissions
CREATE OR REPLACE FUNCTION portfolio.update_user(
    user_id UUID,
    user_email TEXT,
    user_password TEXT,
    user_name TEXT,
    user_roles UUID []
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
WHERE id = user_id;
-- Delete existing roles
DELETE FROM portfolio.user_roles
WHERE user_id = user_id;
-- Assign new roles
FOREACH role_id IN ARRAY user_roles LOOP
INSERT INTO portfolio.user_roles (user_id, role_id)
VALUES (user_id, role_id) ON CONFLICT (user_id, role_id) DO NOTHING;
END LOOP;
-- Return success
result := jsonb_build_object('success', true, 'id', user_id);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a function to delete a user with proper permissions
CREATE OR REPLACE FUNCTION portfolio.delete_user(user_id UUID) RETURNS JSONB AS $$
DECLARE result JSONB;
BEGIN -- Check if the current user has permission to delete users
IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN RAISE EXCEPTION 'Permission denied: You do not have permission to delete users';
END IF;
-- Delete the user from auth.users
DELETE FROM auth.users
WHERE id = user_id;
-- Return success
result := jsonb_build_object('success', true, 'id', user_id);
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a view for users that can be safely accessed
CREATE OR REPLACE VIEW portfolio.users_view AS
SELECT id,
  email,
  raw_user_meta_data AS user_metadata,
  created_at,
  last_sign_in_at,
  updated_at
FROM auth.users;
-- Grant permissions on the view
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON portfolio.users_view TO authenticated;