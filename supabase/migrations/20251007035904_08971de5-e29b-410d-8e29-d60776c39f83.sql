-- Fix infinite recursion in profiles RLS policies
-- Drop problematic policies that query profiles.role
DROP POLICY IF EXISTS "Admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "District admins can view profiles in their district" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view enrolled student profiles" ON public.profiles;

-- Sync user_roles with profiles.role for all users
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Create new policies using has_role() security definer function
CREATE POLICY "Admins can view profiles in their school"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.school_id = profiles.school_id
  )
);

CREATE POLICY "District admins can view profiles in their district"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND EXISTS (
    SELECT 1 
    FROM public.district_users du
    JOIN public.schools s ON s.district_id = du.district_id
    WHERE du.user_id = auth.uid()
    AND s.id = profiles.school_id
  )
);

CREATE POLICY "Teachers can view enrolled student profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND EXISTS (
    SELECT 1 
    FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = profiles.id
    AND c.teacher_id = auth.uid()
  )
);