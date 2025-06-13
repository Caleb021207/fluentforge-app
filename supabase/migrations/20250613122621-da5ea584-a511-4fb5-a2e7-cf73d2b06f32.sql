
-- Drop the existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view profiles of students in their classes" ON public.profiles;

-- Recreate the get_user_role function with proper SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create a simplified admin policy that doesn't cause recursion
CREATE POLICY "Admins can view school profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_user_role() = 'admin' AND 
  school_id IS NOT NULL AND
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);

-- Create a simplified teacher policy that doesn't cause recursion
CREATE POLICY "Teachers can view student profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_user_role() = 'teacher' AND 
  role = 'student' AND
  school_id IS NOT NULL AND
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);
