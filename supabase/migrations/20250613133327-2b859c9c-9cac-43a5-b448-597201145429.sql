-- Add RLS policies for admin access to student data in their school

-- Allow admins to view student enrollments in classes within their school
CREATE POLICY "Admins can view student enrollments in their school" 
ON public.student_enrollments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    JOIN public.classes c ON c.id = student_enrollments.class_id
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND admin_profile.school_id = c.school_id
  )
);

-- Allow admins to view transcript analyses of students in their school
CREATE POLICY "Admins can view student transcript analyses in their school" 
ON public.transcript_analyses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    JOIN public.profiles student_profile ON student_profile.id = transcript_analyses.user_id
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND admin_profile.school_id = student_profile.school_id
  )
);

-- Allow admins to view student language metrics for students in their school
CREATE POLICY "Admins can view student language metrics in their school" 
ON public.student_language_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    JOIN public.profiles student_profile ON student_profile.id = student_language_metrics.user_id
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND admin_profile.school_id = student_profile.school_id
  )
);

-- Allow admins to view student metrics for students in their school
CREATE POLICY "Admins can view student metrics in their school" 
ON public.student_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    JOIN public.profiles student_profile ON student_profile.id = student_metrics.student_id
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND admin_profile.school_id = student_profile.school_id
  )
);