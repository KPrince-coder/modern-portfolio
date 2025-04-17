-- Migration to add the has_permission function

-- Create a function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION portfolio.has_permission(
    permission_name TEXT,
    in_user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
DECLARE 
    has_perm BOOLEAN;
BEGIN
    -- Log for debugging
    RAISE NOTICE 'Checking if user % has permission %', in_user_id, permission_name;
    
    -- Check if the user has the permission through any of their roles
    SELECT EXISTS (
        SELECT 1
        FROM portfolio.user_roles ur
        JOIN portfolio.roles r ON ur.role_id = r.id
        WHERE ur.user_id = in_user_id
        AND r.permissions ? permission_name
    ) INTO has_perm;
    
    -- Return the result
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a public wrapper for the has_permission function
DROP FUNCTION IF EXISTS public.has_permission(TEXT, UUID) CASCADE;

CREATE OR REPLACE FUNCTION public.has_permission(
    permission_name TEXT,
    in_user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
BEGIN
    -- Call the actual function in the portfolio schema
    RETURN portfolio.has_permission(permission_name, in_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.has_permission(permission_name TEXT, in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(permission_name TEXT, in_user_id UUID) TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION portfolio.has_permission(permission_name TEXT, in_user_id UUID) IS 'Checks if a user has a specific permission through any of their roles.';
COMMENT ON FUNCTION public.has_permission(permission_name TEXT, in_user_id UUID) IS 'Public wrapper for portfolio.has_permission to make it easier to call from the frontend.';
