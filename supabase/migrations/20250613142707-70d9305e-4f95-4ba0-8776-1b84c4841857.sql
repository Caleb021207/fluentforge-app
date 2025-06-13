-- Add only the missing RLS policies for district admins

-- Enable RLS and add policies for classes table (only if not exists)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the district admin policy for classes to ensure it works
DROP POLICY IF EXISTS "District admins can view classes in their district" ON public.classes;
CREATE POLICY "District admins can view classes in their district" 
ON public.classes 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.schools s
    JOIN public.district_users du ON du.district_id = s.district_id
    WHERE s.id = classes.school_id
    AND du.user_id = auth.uid()
  )
);

-- Enable RLS and add policies for student_enrollments table
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the district admin policy for enrollments
DROP POLICY IF EXISTS "District admins can view enrollments in their district" ON public.student_enrollments;
CREATE POLICY "District admins can view enrollments in their district" 
ON public.student_enrollments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.classes c
    JOIN public.schools s ON s.id = c.school_id
    JOIN public.district_users du ON du.district_id = s.district_id
    WHERE c.id = student_enrollments.class_id
    AND du.user_id = auth.uid()
  )
);