-- Fix infinite recursion in RLS policies by using security definer functions

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Students can view their enrolled classes" ON public.classes;
DROP POLICY IF EXISTS "School admins can view classes in their school" ON public.classes;
DROP POLICY IF EXISTS "District admins can view classes in their district" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage their classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view and manage their own classes" ON public.classes;

DROP POLICY IF EXISTS "Teachers can view enrollments in their classes" ON public.student_enrollments;
DROP POLICY IF EXISTS "District admins can view enrollments in their district" ON public.student_enrollments;

-- Create security definer functions to check permissions without RLS recursion
CREATE OR REPLACE FUNCTION public.is_student_enrolled_in_class(p_class_id uuid, p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.student_enrollments
    WHERE class_id = p_class_id 
    AND student_id = p_student_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_of_class_school(p_class_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.classes c
    JOIN public.profiles p ON p.school_id = c.school_id
    WHERE c.id = p_class_id
    AND p.id = p_user_id
    AND p.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_district_admin_of_class(p_class_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.classes c
    JOIN public.schools s ON s.id = c.school_id
    JOIN public.district_users du ON du.district_id = s.district_id
    WHERE c.id = p_class_id
    AND du.user_id = p_user_id
    AND du.role = 'admin'
  );
$$;

-- Recreate classes policies using security definer functions
CREATE POLICY "Teachers can manage their classes"
ON public.classes
FOR ALL
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Students can view enrolled classes"
ON public.classes
FOR SELECT
USING (is_student_enrolled_in_class(id, auth.uid()));

CREATE POLICY "School admins can view classes"
ON public.classes
FOR SELECT
USING (is_admin_of_class_school(id, auth.uid()));

CREATE POLICY "District admins can view classes"
ON public.classes
FOR SELECT
USING (is_district_admin_of_class(id, auth.uid()));

-- Fix student_enrollments policies
CREATE POLICY "Teachers view enrollments in their classes"
ON public.student_enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = student_enrollments.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "District admins view enrollments"
ON public.student_enrollments
FOR SELECT
USING (is_district_admin_of_class(class_id, auth.uid()));