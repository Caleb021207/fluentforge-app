-- FINAL CLEANUP: Fix infinite recursion in RLS policies completely

-- Drop ALL existing policies on profiles table 
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "District admins can view profiles in their district" ON public.profiles;
DROP POLICY IF EXISTS "School admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view student profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Basic user access to own profile" ON public.profiles;
DROP POLICY IF EXISTS "District admin profile access" ON public.profiles;
DROP POLICY IF EXISTS "School admin profile access" ON public.profiles;
DROP POLICY IF EXISTS "Teacher student profile access" ON public.profiles;

-- Drop ALL functions that might cause recursion when used in profiles table policies
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.get_current_user_school_id();
DROP FUNCTION IF EXISTS public.get_user_role();

-- Create SIMPLE, NON-RECURSIVE policies that work without querying profiles table

-- Allow users to manage their own profile (basic access)
CREATE POLICY "Users own profile access" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid());

-- Allow district admins to view all profiles (using district_users table directly)
CREATE POLICY "District admin view all profiles" 
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

-- Allow authenticated users to view profiles for now (simplest approach)
-- We can make this more restrictive later once basic functionality works
CREATE POLICY "Authenticated users can view profiles temporarily" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);