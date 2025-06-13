-- First, drop any policies that depend on get_user_role()
DROP POLICY IF EXISTS "Admins can view all classes in their school" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view classes they teach" ON public.classes;
DROP POLICY IF EXISTS "Students can view their enrolled classes" ON public.classes;

-- Drop ALL existing policies and functions that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin school profile access" ON public.profiles;
DROP POLICY IF EXISTS "Teacher student profile access" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Now drop the function
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.get_current_user_profile();
DROP FUNCTION IF EXISTS public.auth_user_id();

-- Create a simple, non-recursive security definer function
CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Create basic policies that don't cause recursion
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = public.auth_user_id());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = public.auth_user_id());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = public.auth_user_id());

-- For now, let's make profiles readable by authenticated users to avoid complexity
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);