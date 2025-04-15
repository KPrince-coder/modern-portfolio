-- Fix the ambiguous user_id reference in the update_user function
CREATE OR REPLACE FUNCTION portfolio.update_user(
  user_id UUID,
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_roles UUID[]
) RETURNS JSONB AS $$
DECLARE
  role_id UUID;
  result JSONB;
BEGIN
  -- Check if the current user has permission to update users
  IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN
    RAISE EXCEPTION 'Permission denied: You do not have permission to update users';
  END IF;

  -- Update the user in auth.users
  UPDATE auth.users
  SET 
    email = user_email,
    raw_user_meta_data = jsonb_build_object('name', user_name),
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Delete existing roles - Fix the ambiguous column reference by using table alias
  DELETE FROM portfolio.user_roles ur
  WHERE ur.user_id = update_user.user_id;
  
  -- Assign new roles
  FOREACH role_id IN ARRAY user_roles
  LOOP
    INSERT INTO portfolio.user_roles (user_id, role_id)
    VALUES (update_user.user_id, role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END LOOP;
  
  -- Return success
  result := jsonb_build_object(
    'success', true,
    'id', user_id
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix the delete_user function to avoid potential similar issues
CREATE OR REPLACE FUNCTION portfolio.delete_user(
  user_id UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if the current user has permission to delete users
  IF NOT portfolio.has_permission(auth.uid(), 'manage_users') THEN
    RAISE EXCEPTION 'Permission denied: You do not have permission to delete users';
  END IF;

  -- Delete the user from auth.users
  DELETE FROM auth.users
  WHERE id = delete_user.user_id;
  
  -- Return success
  result := jsonb_build_object(
    'success', true,
    'id', user_id
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
