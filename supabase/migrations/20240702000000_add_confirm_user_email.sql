-- Function to confirm a user's email
CREATE OR REPLACE FUNCTION portfolio.confirm_user_email(
  in_user_id UUID
) RETURNS JSONB AS $$
DECLARE 
  result JSONB;
BEGIN
  -- Check if the current user has permission to manage users
  IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN
    RAISE EXCEPTION 'Permission denied: You do not have permission to manage users';
  END IF;

  -- Log the action for debugging
  RAISE NOTICE 'Confirming email for user %', in_user_id;
  
  -- Update the user's email_confirmed_at field in auth.users
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = in_user_id;

  -- Return success
  result := jsonb_build_object('success', true, 'id', in_user_id);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION portfolio.confirm_user_email(UUID) TO authenticated;

/*
 --------------------------------------------------------------------------------
 ADD CONFIRM USER EMAIL FUNCTION
 --------------------------------------------------------------------------------
 
 This migration adds a function to confirm a user's email address. This is useful
 for admins who need to manually confirm a user's email without requiring the user
 to click on a confirmation link.
 
 The function:
 1. Checks if the current user has permission to manage users
 2. Updates the user's email_confirmed_at field in auth.users
 3. Returns a success message
 
 Usage example:
 
 ```javascript
 const { data, error } = await supabase.rpc('confirm_user_email', {
   in_user_id: 'user-uuid'
 });
 ```
 
 --------------------------------------------------------------------------------
 */
