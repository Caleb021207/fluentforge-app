-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "District admins can view profiles in their district" ON public.profiles;

-- Create security definer function to check if user is admin of a school
CREATE OR REPLACE FUNCTION public.is_admin_of_school(p_user_id uuid, p_target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles admin_profile
    WHERE admin_profile.id = p_user_id
      AND admin_profile.role = 'admin'
      AND admin_profile.school_id IS NOT NULL
      AND admin_profile.school_id = (
        SELECT school_id 
        FROM public.profiles 
        WHERE id = p_target_user_id
      )
  )
$$;

-- Create security definer function to check if user is district admin
CREATE OR REPLACE FUNCTION public.is_district_admin_of_user(p_user_id uuid, p_target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.district_users du
    JOIN public.schools s ON s.district_id = du.district_id
    JOIN public.profiles sp ON sp.school_id = s.id
    WHERE du.user_id = p_user_id
      AND sp.id = p_target_user_id
  )
$$;

-- Recreate policies using safe security definer functions
CREATE POLICY "Admins can view profiles in their school" 
ON public.profiles
FOR SELECT 
USING (is_admin_of_school(auth.uid(), id));

CREATE POLICY "District admins can view profiles in their district" 
ON public.profiles
FOR SELECT 
USING (is_district_admin_of_user(auth.uid(), id));