
-- Drop all existing policies on profiles table to start clean
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin school profile access" ON public.profiles;
DROP POLICY IF EXISTS "Teacher student profile access" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "District admins can view student profiles in their district" ON public.profiles;

-- Create clean, simple policies that avoid recursion
CREATE POLICY "Users can manage their own profile" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid());

-- Allow district admins to view profiles without causing recursion
-- This uses the security definer function that already exists
CREATE POLICY "District admins can view profiles in their district" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 
    FROM public.schools s
    JOIN public.district_users du ON du.district_id = s.district_id
    WHERE s.id = profiles.school_id
    AND du.user_id = auth.uid()
  )
);

-- Allow school admins to view profiles in their school
CREATE POLICY "School admins can view profiles in their school"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid() OR
  (public.get_current_user_role() = 'admin' AND school_id = public.get_current_user_school_id())
);

-- Allow teachers to view student profiles in their school
CREATE POLICY "Teachers can view student profiles in their school"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid() OR
  (public.get_current_user_role() = 'teacher' AND role = 'student' AND school_id = public.get_current_user_school_id())
);
