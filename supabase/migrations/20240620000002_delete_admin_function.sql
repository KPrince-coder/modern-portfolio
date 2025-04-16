-- Delete Admin Function Migration
-- This file contains a function to delete an admin user by email

-- Drop the function if it exists
DROP FUNCTION IF EXISTS portfolio.delete_admin_by_email(TEXT) CASCADE;

-- Function to delete an admin user by email
CREATE OR REPLACE FUNCTION portfolio.delete_admin_by_email(
  admin_email TEXT
)
RETURNS JSONB AS $$
DECLARE
  admin_id UUID;
  result JSONB;
BEGIN
  -- Find the admin user ID
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user with email % not found', admin_email;
  END IF;
  
  -- Delete the user from auth.users (this will cascade to user_roles due to foreign key)
  DELETE FROM auth.users
  WHERE id = admin_id;
  
  -- Return success
  result := jsonb_build_object(
    'success', true,
    'message', format('Admin user with email %s has been deleted', admin_email)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION portfolio.delete_admin_by_email TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.delete_admin_by_email TO anon;

/*
--------------------------------------------------------------------------------
                        DOCUMENTATION
--------------------------------------------------------------------------------

This migration adds a function to delete an admin user by email.
This function can be used to clean up test admin users or reset the system.

## Function Parameters

### delete_admin_by_email
- admin_email: Email address of the admin user to delete

## Client Usage Example

```javascript
// Delete an admin user by email
const { data, error } = await supabase.rpc('delete_admin_by_email', {
  admin_email: 'admin@example.com'
});
```

## Security Considerations

1. This function is granted to both authenticated and anonymous users for testing purposes
2. In a production environment, you should restrict this function to authenticated admins only
3. The function uses SECURITY DEFINER to run with elevated privileges

## Important Notes

1. This function completely removes the user from the database
2. All associated data (roles, etc.) will be deleted due to foreign key constraints
3. This operation cannot be undone
4. Use with caution in production environments

--------------------------------------------------------------------------------
*/
