-- Migration to add the is_admin() function
-- Create a function to check if the current user is an admin (no parameters)
CREATE OR REPLACE FUNCTION portfolio.is_admin() RETURNS BOOLEAN AS $$ BEGIN -- Call the is_admin function with the current user's ID
    RETURN portfolio.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a public wrapper for the is_admin function
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ BEGIN -- Call the actual function in the portfolio schema
    RETURN portfolio.is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
-- Add a comment explaining the function
COMMENT ON FUNCTION portfolio.is_admin() IS 'Checks if the current user is an admin.';
COMMENT ON FUNCTION public.is_admin() IS 'Public wrapper for portfolio.is_admin to make it easier to call from the frontend.';
-- Add this file to solve error in the AIHistory file