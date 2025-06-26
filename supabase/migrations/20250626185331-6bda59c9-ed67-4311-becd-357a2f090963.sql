
-- First, let's ensure district admins can see schools in their district
-- (This policy might already exist, but let's make sure it's correct)
DROP POLICY IF EXISTS "District admins can view schools in their district" ON public.schools;
CREATE POLICY "District admins can view schools in their district" 
ON public.schools 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.district_users du 
    WHERE du.user_id = auth.uid() 
    AND du.district_id = schools.district_id
  )
);

-- Ensure district admins can see classes in schools within their district
DROP POLICY IF EXISTS "District admins can view classes in their district" ON public.classes;
CREATE POLICY "District admins can view classes in their district" 
ON public.classes 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.schools s
    JOIN public.district_users du ON du.district_id = s.district_id
    WHERE s.id = classes.school_id
    AND du.user_id = auth.uid()
  )
);

-- Ensure district admins can see student enrollments in their district
DROP POLICY IF EXISTS "District admins can view enrollments in their district" ON public.student_enrollments;
CREATE POLICY "District admins can view enrollments in their district" 
ON public.student_enrollments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.classes c
    JOIN public.schools s ON s.id = c.school_id
    JOIN public.district_users du ON du.district_id = s.district_id
    WHERE c.id = student_enrollments.class_id
    AND du.user_id = auth.uid()
  )
);

-- Ensure district admins can see student profiles in their district
DROP POLICY IF EXISTS "District admins can view student profiles in their district" ON public.profiles;
CREATE POLICY "District admins can view student profiles in their district" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Allow users to see their own profile
  id = auth.uid() OR
  -- District admins can see profiles of students in their district schools
  EXISTS (
    SELECT 1 
    FROM public.schools s
    JOIN public.district_users du ON du.district_id = s.district_id
    WHERE s.id = profiles.school_id
    AND du.user_id = auth.uid()
  )
);

-- Ensure district admins can see transcript analyses from students in their district
DROP POLICY IF EXISTS "District admins can view transcript analyses in their district" ON public.transcript_analyses;
CREATE POLICY "District admins can view transcript analyses in their district" 
ON public.transcript_analyses 
FOR SELECT 
TO authenticated
USING (
  -- Users can see their own analyses
  user_id = auth.uid() OR
  -- District admins can see analyses from students in their district
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.schools s ON s.id = p.school_id
    JOIN public.district_users du ON du.district_id = s.district_id
    WHERE p.id = transcript_analyses.user_id
    AND du.user_id = auth.uid()
  )
);
