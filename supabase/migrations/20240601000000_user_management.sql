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
-- Create RLS policies for roles table
ALTER TABLE portfolio.roles ENABLE ROW LEVEL SECURITY;
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
-- Create RLS policies for user_roles table
ALTER TABLE portfolio.user_roles ENABLE ROW LEVEL SECURITY;
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
-- Create RLS policies for audit_logs table
ALTER TABLE portfolio.audit_logs ENABLE ROW LEVEL SECURITY;
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