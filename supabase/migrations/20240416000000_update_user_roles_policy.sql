-- Drop existing policy
DROP POLICY IF EXISTS manage_user_roles ON portfolio.user_roles;
-- Create a new policy that allows admins to view all user roles
CREATE POLICY manage_user_roles ON portfolio.user_roles USING (portfolio.is_admin_current());
-- Create a separate policy for viewing user roles
CREATE POLICY view_user_roles ON portfolio.user_roles FOR
SELECT USING (portfolio.is_admin_current());
-- Grant necessary permissions
GRANT SELECT ON portfolio.user_roles TO authenticated;
-- Add a comment explaining the policy
COMMENT ON POLICY manage_user_roles ON portfolio.user_roles IS 'Allows administrators to manage (insert, update, delete) user roles';
COMMENT ON POLICY view_user_roles ON portfolio.user_roles IS 'Allows administrators to view all user roles';