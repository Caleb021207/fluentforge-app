-- Fix circular RLS policy dependencies causing timeouts

-- Drop existing problematic policies on classes table first
DROP POLICY IF EXISTS "Students can view classes they are enrolled in" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "District admins can view classes in their district" ON public.classes;

-- Now drop the problematic function with CASCADE
DROP FUNCTION IF EXISTS public.is_user_enrolled_in_class(uuid) CASCADE;

-- Create simplified, non-recursive policies for classes table
CREATE POLICY "Students can view their enrolled classes"
ON public.classes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments
    WHERE student_enrollments.class_id = classes.id 
    AND student_enrollments.student_id = auth.uid()
  )
);

CREATE POLICY "Teachers can view and manage their own classes"
ON public.classes
FOR ALL
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "District admins can view classes in their district"
ON public.classes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schools s
    JOIN public.district_users du ON du.district_id = s.district_id
    WHERE s.id = classes.school_id 
    AND du.user_id = auth.uid()
    AND du.role = 'admin'
  )
);

CREATE POLICY "School admins can view classes in their school"
ON public.classes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
    AND p.school_id = classes.school_id
  )
);

-- Recreate helper function for teachers
CREATE OR REPLACE FUNCTION public.is_user_teacher_of_class(class_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = class_id_param AND teacher_id = auth.uid()
  );
$$;