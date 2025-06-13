-- Add RLS policies for transcript_analyses table to allow proper access

-- Users can view their own transcript analyses
CREATE POLICY "Users can view own transcript analyses" 
ON public.transcript_analyses 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can insert their own transcript analyses
CREATE POLICY "Users can insert own transcript analyses" 
ON public.transcript_analyses 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own transcript analyses
CREATE POLICY "Users can update own transcript analyses" 
ON public.transcript_analyses 
FOR UPDATE 
USING (user_id = auth.uid());

-- Teachers can view transcript analyses of students in their classes
CREATE POLICY "Teachers can view student transcript analyses" 
ON public.transcript_analyses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = transcript_analyses.user_id 
    AND c.teacher_id = auth.uid()
  )
);

-- Admins can view transcript analyses of students in their school
CREATE POLICY "Admins can view school student transcript analyses" 
ON public.transcript_analyses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles teacher_profile
    JOIN public.profiles student_profile ON student_profile.id = transcript_analyses.user_id
    WHERE teacher_profile.id = auth.uid() 
    AND teacher_profile.role = 'admin'
    AND teacher_profile.school_id = student_profile.school_id
  )
);

-- For testing: allow authenticated users to view all analyses (can be removed later)
CREATE POLICY "Authenticated users can view all transcript analyses for testing" 
ON public.transcript_analyses 
FOR SELECT 
TO authenticated
USING (true);