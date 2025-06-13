-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view profiles of students in their classes" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view school profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view student profiles" ON public.profiles;

-- Recreate the get_user_role function with proper SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create basic user policies first
CREATE POLICY "Allow users to view own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Allow users to update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Allow users to insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Create simplified admin policy that avoids recursion
CREATE POLICY "Admin school profile access" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_user_role() = 'admin' AND 
  school_id = (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- Create simplified teacher policy that avoids recursion  
CREATE POLICY "Teacher student profile access" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_user_role() = 'teacher' AND 
  role = 'student' AND
  school_id = (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
);