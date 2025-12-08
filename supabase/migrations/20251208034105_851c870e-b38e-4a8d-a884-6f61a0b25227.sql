-- Drop the problematic policy
DROP POLICY IF EXISTS "Restricted profile viewing" ON public.profiles;

-- Create security definer function to check if user is admin of same school
CREATE OR REPLACE FUNCTION public.is_school_admin_of_profile(target_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND school_id = target_school_id
  );
$$;

-- Recreate policy using the security definer function
CREATE POLICY "Restricted profile viewing"
ON public.profiles
FOR SELECT
USING (
  -- User can always see their own profile
  auth.uid() = id
  OR
  -- Teachers can see students in their classes
  EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = profiles.id
    AND c.teacher_id = auth.uid()
  )
  OR
  -- School admins can see profiles in their school (using security definer function)
  public.is_school_admin_of_profile(profiles.school_id)
  OR
  -- District admins can see profiles in their district
  EXISTS (
    SELECT 1 FROM public.district_users du
    JOIN public.schools s ON s.district_id = du.district_id
    WHERE du.user_id = auth.uid()
    AND du.role = 'admin'
    AND profiles.school_id = s.id
  )
);