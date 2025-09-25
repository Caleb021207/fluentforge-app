-- Fix infinite recursion by dropping and recreating problematic policies with security definer functions

-- First, create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop the problematic policies
DROP POLICY IF EXISTS "School admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view other teachers in their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile (except role)" ON public.profiles;

-- Recreate policies using security definer functions to avoid recursion
CREATE POLICY "School admins can view profiles in their school" ON public.profiles
FOR SELECT USING (
  public.get_current_user_role() = 'admin' 
  AND public.get_current_user_school_id() = school_id
);

CREATE POLICY "Teachers can view other teachers in their school" ON public.profiles
FOR SELECT USING (
  role = 'teacher' 
  AND public.get_current_user_role() = 'teacher' 
  AND public.get_current_user_school_id() = school_id
);

CREATE POLICY "Users can update their own profile (except role)" ON public.profiles
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() 
  AND (role IS NULL OR role = public.get_current_user_role())
);