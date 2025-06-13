-- Fix infinite recursion by replacing problematic policies with security definer functions

-- Drop the problematic policy on classes that's causing recursion
DROP POLICY IF EXISTS "Users can view classes in their school" ON public.classes;

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

-- Create a new non-recursive policy for classes
CREATE POLICY "Users can view classes in their school v2" 
ON public.classes 
FOR SELECT 
USING (
  -- Teachers can see their own classes
  teacher_id = auth.uid() OR
  -- Students can see classes they're enrolled in
  is_user_enrolled_in_class(id) OR
  -- Admins can see classes in their school
  (public.get_current_user_role() = 'admin' AND school_id = public.get_current_user_school_id())
);

-- Update existing problematic enrollment policy if it exists
DROP POLICY IF EXISTS "Admins can view student enrollments in their school" ON public.student_enrollments;

CREATE POLICY "Admins can view student enrollments in their school v2" 
ON public.student_enrollments 
FOR SELECT 
USING (
  -- Students can see their own enrollments
  student_id = auth.uid() OR
  -- Teachers can see enrollments in their classes
  is_user_teacher_of_class(class_id) OR
  -- Admins can see enrollments in their school
  (public.get_current_user_role() = 'admin' AND public.is_student_in_admin_school(student_id))
);

-- Create policies for other tables
DROP POLICY IF EXISTS "Admins can view student transcript analyses via class enrollment" ON public.transcript_analyses;
CREATE POLICY "Admins can view student transcript analyses via class enrollment" 
ON public.transcript_analyses 
FOR SELECT 
USING (
  user_id = auth.uid() OR
  (public.get_current_user_role() = 'admin' AND public.is_student_in_admin_school(user_id))
);

DROP POLICY IF EXISTS "Admins can view student language metrics via class enrollment" ON public.student_language_metrics;
CREATE POLICY "Admins can view student language metrics via class enrollment" 
ON public.student_language_metrics 
FOR SELECT 
USING (
  user_id = auth.uid() OR
  (public.get_current_user_role() = 'admin' AND public.is_student_in_admin_school(user_id))
);

DROP POLICY IF EXISTS "Admins can view student metrics via class enrollment" ON public.student_metrics;
CREATE POLICY "Admins can view student metrics via class enrollment" 
ON public.student_metrics 
FOR SELECT 
USING (
  student_id = auth.uid() OR
  (public.get_current_user_role() = 'admin' AND public.is_student_in_admin_school(student_id))
);