-- =============================================
-- CLEANUP: Remove parental consent & email capture systems
-- =============================================

-- Drop email_captures table (publicly insertable - security issue)
DROP TABLE IF EXISTS public.email_captures CASCADE;

-- Drop parental_consent_records table (consent handled in-person)
DROP TABLE IF EXISTS public.parental_consent_records CASCADE;

-- Drop directory_information_preferences table (no parent data needed)
DROP TABLE IF EXISTS public.directory_information_preferences CASCADE;

-- Drop the parental consent check function
DROP FUNCTION IF EXISTS public.has_valid_parental_consent(uuid, text);

-- Remove contact columns from schools table (not needed)
ALTER TABLE public.schools 
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS principal_name,
  DROP COLUMN IF EXISTS address;

-- =============================================
-- TIGHTEN: Profiles email visibility
-- =============================================

-- Drop existing permissive policies that might expose emails
DROP POLICY IF EXISTS "Students can view classmate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in same school" ON public.profiles;

-- Create restrictive policy for email visibility
-- Email only visible to: self, teachers of enrolled classes, school admins, district admins
CREATE POLICY "Restricted profile viewing"
ON public.profiles
FOR SELECT
USING (
  -- User can always see their own profile
  auth.uid() = id
  OR
  -- Teachers can see students in their classes
  EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = profiles.id
    AND c.teacher_id = auth.uid()
  )
  OR
  -- School admins can see profiles in their school
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
    AND admin_profile.school_id = profiles.school_id
  )
  OR
  -- District admins can see profiles in their district
  EXISTS (
    SELECT 1 FROM public.district_users du
    JOIN public.schools s ON s.district_id = du.district_id
    WHERE du.user_id = auth.uid()
    AND du.role = 'admin'
    AND profiles.school_id = s.id
  )
);