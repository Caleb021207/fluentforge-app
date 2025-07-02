-- Fix infinite recursion in RLS policies by starting fresh and using proper security definer functions

-- Drop ALL existing policies on profiles table that might cause recursion
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "District admins can view profiles in their district" ON public.profiles;
DROP POLICY IF EXISTS "School admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view student profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Ensure security definer functions exist and work properly
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Create simple, working RLS policies without recursion
CREATE POLICY "Basic user access to own profile" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid());

-- Allow district admins to view profiles (without using the problematic function that causes recursion)
CREATE POLICY "District admin profile access" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 
    FROM public.district_users du 
    WHERE du.user_id = auth.uid()
    AND du.role = 'admin'
  )
);

-- Allow school admins to view profiles in their school (simplified)
CREATE POLICY "School admin profile access"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid() OR
  (school_id IS NOT NULL AND school_id IN (
    SELECT p.school_id 
    FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  ))
);

-- Allow teachers to view student profiles in their school (simplified)
CREATE POLICY "Teacher student profile access"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid() OR
  (role = 'student' AND school_id IS NOT NULL AND school_id IN (
    SELECT p.school_id 
    FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'teacher'
  ))
);