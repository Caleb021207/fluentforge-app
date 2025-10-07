-- Add RLS policy for teachers to view enrolled student profiles
CREATE POLICY "Teachers can view enrolled student profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = profiles.id
    AND c.teacher_id = auth.uid()
  )
);

-- Add RLS policy for admins to view profiles in their school
CREATE POLICY "Admins can view profiles in their school"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
    AND admin_profile.school_id = profiles.school_id
  )
);

-- Add RLS policy for district admins to view profiles in their district
CREATE POLICY "District admins can view profiles in their district"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.district_users du
    JOIN public.schools s ON s.district_id = du.district_id
    WHERE du.user_id = auth.uid()
    AND s.id = profiles.school_id
  )
);