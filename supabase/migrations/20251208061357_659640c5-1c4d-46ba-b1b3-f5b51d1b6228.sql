-- Create a security definer function to check if user is admin of another user's school
-- This avoids infinite recursion by bypassing RLS on the profiles table
CREATE OR REPLACE FUNCTION public.is_admin_of_user_school(admin_user_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles admin_profile
    JOIN public.profiles user_profile ON user_profile.school_id = admin_profile.school_id
    WHERE admin_profile.id = admin_user_id
      AND admin_profile.role = 'admin'
      AND user_profile.id = target_user_id
  )
$$;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view progression in their school" ON public.user_progression;

-- Recreate the policy using the security definer function
CREATE POLICY "Admins can view progression in their school"
ON public.user_progression
FOR SELECT
USING (public.is_admin_of_user_school(auth.uid(), user_id));