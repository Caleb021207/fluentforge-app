-- Add RLS policies to allow district admins to see their schools

-- Enable RLS on schools table (if not already enabled)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Allow district admins to view schools in their district
CREATE POLICY "District admins can view schools in their district" 
ON public.schools 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.district_users du 
    WHERE du.user_id = auth.uid() 
    AND du.district_id = schools.district_id
  )
);

-- Allow school admins to view their own school
CREATE POLICY "School admins can view their own school" 
ON public.schools 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.school_id = schools.id 
    AND p.role = 'admin'
  )
);

-- Allow teachers to view their school
CREATE POLICY "Teachers can view their school" 
ON public.schools 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.school_id = schools.id 
    AND p.role = 'teacher'
  )
);

-- Allow students to view their school
CREATE POLICY "Students can view their school" 
ON public.schools 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.school_id = schools.id 
    AND p.role = 'student'
  )
);