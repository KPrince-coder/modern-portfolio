-- Create a public wrapper for the portfolio.assign_admin_role function
-- This allows the function to be called via RPC without specifying the schema
-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.assign_admin_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.assign_admin_role(in_user_id UUID) CASCADE;
-- Create a wrapper function in the public schema
CREATE OR REPLACE FUNCTION public.assign_admin_role(in_user_id UUID) RETURNS JSONB AS $$ BEGIN -- Call the actual function in the portfolio schema
  RETURN portfolio.assign_admin_role(in_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.assign_admin_role(in_user_id UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_admin_role(in_user_id UUID) TO anon;
/*
 --------------------------------------------------------------------------------
 DOCUMENTATION
 --------------------------------------------------------------------------------
 
 This migration adds a public wrapper for the portfolio.assign_admin_role function,
 which allows it to be called via RPC without specifying the schema.
 
 ## Function Parameters
 
 ### assign_admin_role
 - in_user_id: UUID of the user to assign the admin role to
 
 ## Example Usage
 
 ```javascript
 // Using the public wrapper function
 const { data, error } = await supabase.rpc('assign_admin_role', {
 in_user_id: 'USER_UUID_HERE' // Replace with the actual UUID
 });
 ```
 
 ## Important Notes
 
 1. This is a wrapper function that calls the actual function in the portfolio schema
 2. This allows the function to be called via RPC without specifying the schema
 3. The function has the same parameters and return value as the original function
 
 --------------------------------------------------------------------------------
 */