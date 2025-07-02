-- Fix student metrics visibility for admins and teachers

-- Add SELECT policies for student_language_metrics
CREATE POLICY "Users can view their own language metrics" 
ON public.student_language_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view student language metrics in their school" 
ON public.student_language_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.profiles admin_profile, public.profiles student_profile
  WHERE admin_profile.id = auth.uid() 
  AND admin_profile.role = 'admin'
  AND student_profile.id = student_language_metrics.user_id
  AND student_profile.school_id = admin_profile.school_id
));

CREATE POLICY "Teachers can view student language metrics via enrollments" 
ON public.student_language_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.student_enrollments se
  JOIN public.classes c ON c.id = se.class_id
  WHERE se.student_id = student_language_metrics.user_id 
  AND c.teacher_id = auth.uid()
));

CREATE POLICY "District admins can view all student language metrics in district" 
ON public.student_language_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.district_users du
  JOIN public.schools s ON s.district_id = du.district_id
  JOIN public.profiles sp ON sp.school_id = s.id
  WHERE du.user_id = auth.uid() 
  AND sp.id = student_language_metrics.user_id
));

-- Add SELECT policies for student_metrics
CREATE POLICY "Users can view their own metrics" 
ON public.student_metrics 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Admins can view student metrics in their school" 
ON public.student_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.profiles admin_profile, public.profiles student_profile
  WHERE admin_profile.id = auth.uid() 
  AND admin_profile.role = 'admin'
  AND student_profile.id = student_metrics.student_id
  AND student_profile.school_id = admin_profile.school_id
));

CREATE POLICY "Teachers can view student metrics via enrollments" 
ON public.student_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.student_enrollments se
  JOIN public.classes c ON c.id = se.class_id
  WHERE se.student_id = student_metrics.student_id 
  AND c.teacher_id = auth.uid()
));

CREATE POLICY "District admins can view all student metrics in district" 
ON public.student_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.district_users du
  JOIN public.schools s ON s.district_id = du.district_id
  JOIN public.profiles sp ON sp.school_id = s.id
  WHERE du.user_id = auth.uid() 
  AND sp.id = student_metrics.student_id
));