-- Update student profile to assign them to Palavox High School
UPDATE public.profiles 
SET school_id = '1d0d9925-e0b7-40f8-8402-c57d0ad14400'
WHERE email = 'mr.suit008@gmail.com' AND role = 'student';

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Admins can view student transcript analyses in their school" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Admins can view student language metrics in their school" ON public.student_language_metrics;
DROP POLICY IF EXISTS "Admins can view student metrics in their school" ON public.student_metrics;

-- Create improved policies that work based on class enrollment relationships
CREATE POLICY "Admins can view student transcript analyses via class enrollment" 
ON public.transcript_analyses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    JOIN public.classes c ON c.school_id = admin_profile.school_id
    JOIN public.student_enrollments se ON se.class_id = c.id
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND se.student_id = transcript_analyses.user_id
  )
);

CREATE POLICY "Admins can view student language metrics via class enrollment" 
ON public.student_language_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    JOIN public.classes c ON c.school_id = admin_profile.school_id
    JOIN public.student_enrollments se ON se.class_id = c.id
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND se.student_id = student_language_metrics.user_id
  )
);

CREATE POLICY "Admins can view student metrics via class enrollment" 
ON public.student_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    JOIN public.classes c ON c.school_id = admin_profile.school_id
    JOIN public.student_enrollments se ON se.class_id = c.id
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND se.student_id = student_metrics.student_id
  )
);