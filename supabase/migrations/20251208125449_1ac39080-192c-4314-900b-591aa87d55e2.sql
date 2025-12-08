-- =============================================
-- FIX PROFILES TABLE RLS POLICIES
-- =============================================

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view enrolled student profiles" ON public.profiles;
DROP POLICY IF EXISTS "District admins can view profiles in their district" ON public.profiles;

-- Recreate policies with TO authenticated
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Teachers can view enrolled student profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND EXISTS (
    SELECT 1 FROM student_enrollments se
    JOIN classes c ON c.id = se.class_id
    WHERE se.student_id = profiles.id 
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Admins can view profiles in their school"
ON public.profiles FOR SELECT TO authenticated
USING (is_admin_of_school(auth.uid(), id));

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "District admins can view profiles in their district"
ON public.profiles FOR SELECT TO authenticated
USING (is_district_admin_of_user(auth.uid(), id));

-- =============================================
-- FIX TRANSCRIPT_ANALYSES TABLE RLS POLICIES
-- =============================================

-- Drop all existing policies (including duplicates)
DROP POLICY IF EXISTS "Users can delete their own transcript analyses" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Users can insert their own transcript analyses" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Users can update their own transcript analyses" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Users can view their own transcript analyses" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Teachers can view student transcript analyses" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Admins can view school student transcript analyses" ON public.transcript_analyses;
DROP POLICY IF EXISTS "District admins can view district transcript analyses" ON public.transcript_analyses;

-- Recreate policies with TO authenticated
CREATE POLICY "Users can view their own transcript analyses"
ON public.transcript_analyses FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transcript analyses"
ON public.transcript_analyses FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transcript analyses"
ON public.transcript_analyses FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own transcript analyses"
ON public.transcript_analyses FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Teachers can view student transcript analyses"
ON public.transcript_analyses FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM student_enrollments se
    JOIN classes c ON c.id = se.class_id
    WHERE se.student_id = transcript_analyses.user_id
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Admins can view school student transcript analyses"
ON public.transcript_analyses FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile
    JOIN profiles student_profile ON student_profile.school_id = admin_profile.school_id
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
    AND student_profile.id = transcript_analyses.user_id
  )
);

CREATE POLICY "District admins can view district transcript analyses"
ON public.transcript_analyses FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM district_users du
    JOIN schools s ON s.district_id = du.district_id
    JOIN profiles sp ON sp.school_id = s.id
    WHERE du.user_id = auth.uid()
    AND sp.id = transcript_analyses.user_id
  )
);