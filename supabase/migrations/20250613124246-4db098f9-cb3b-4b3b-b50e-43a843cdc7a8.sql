-- Create function to change user role for testing purposes only
CREATE OR REPLACE FUNCTION public.change_user_role_for_testing(target_role text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  result json;
BEGIN
  -- Get the current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  -- Validate the target role
  IF target_role NOT IN ('student', 'teacher', 'admin', 'district') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid role. Must be one of: student, teacher, admin, district'
    );
  END IF;

  -- Update the user's role
  UPDATE public.profiles 
  SET role = target_role, updated_at = now()
  WHERE id = current_user_id;

  -- Check if the update was successful
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Role successfully changed to ' || target_role
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Profile not found or update failed'
    );
  END IF;
END;
$$;