-- Fix infinite recursion by dropping policies first, then functions

-- Drop all policies that use the recursive functions
DROP POLICY IF EXISTS "School admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view other teachers in their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile (except role)" ON public.profiles;

-- Now drop the recursive functions
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.get_current_user_school_id();

-- Drop any remaining problematic policies
DROP POLICY IF EXISTS "Teachers can view student profiles in their classes" ON public.profiles;
DROP POLICY IF EXISTS "District admins can view profiles in their district" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Keep admin policy using the existing is_admin_user function
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));