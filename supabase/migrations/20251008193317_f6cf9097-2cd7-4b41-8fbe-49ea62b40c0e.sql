-- Create function to get user's last sign in time from auth.users
CREATE OR REPLACE FUNCTION public.get_user_last_sign_in(user_id uuid)
RETURNS timestamp with time zone
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT last_sign_in_at
  FROM auth.users
  WHERE id = user_id;
$$;