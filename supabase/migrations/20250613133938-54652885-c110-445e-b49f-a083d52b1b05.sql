-- Fix infinite recursion in RLS policies by creating security definer functions

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view student enrollments in their school" ON public.student_enrollments;
DROP POLICY IF EXISTS "Admins can view student transcript analyses via class enrollment" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Admins can view student language metrics via class enrollment" ON public.student_language_metrics;
DROP POLICY IF EXISTS "Admins can view student metrics via class enrollment" ON public.student_metrics;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_student_in_admin_school(student_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_school_id UUID;
  student_in_school BOOLEAN := FALSE;
BEGIN
  -- Get admin's school
  SELECT school_id INTO admin_school_id 
  FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin';
  
  IF admin_school_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if student is enrolled in any class in admin's school
  SELECT EXISTS (
    SELECT 1 
    FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = student_user_id 
    AND c.school_id = admin_school_id
  ) INTO student_in_school;
  
  RETURN student_in_school;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple, non-recursive policies using these functions
CREATE POLICY "Admins can view student enrollments in their school" 
ON public.student_enrollments 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin' AND
  public.is_student_in_admin_school(student_id)
);

CREATE POLICY "Admins can view student transcript analyses via class enrollment" 
ON public.transcript_analyses 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin' AND
  public.is_student_in_admin_school(user_id)
);

CREATE POLICY "Admins can view student language metrics via class enrollment" 
ON public.student_language_metrics 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin' AND
  public.is_student_in_admin_school(user_id)
);

CREATE POLICY "Admins can view student metrics via class enrollment" 
ON public.student_metrics 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin' AND
  public.is_student_in_admin_school(student_id)
);