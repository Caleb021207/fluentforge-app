-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can update their own profile (except role)" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.profiles;

-- Recreate the user profile update policy without recursion
CREATE POLICY "Users can update their own profile (except role)" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND 
  (role IS NULL OR role = (
    SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()
  ))
);

-- Recreate admin role management policy using a security definer function
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

CREATE POLICY "Admins can manage roles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin_user(auth.uid()));

-- Also fix any other potentially recursive policies
DROP POLICY IF EXISTS "School admins can view profiles in their school" ON public.profiles;
CREATE POLICY "School admins can view profiles in their school" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin' 
    AND admin_profile.school_id = profiles.school_id
  )
);