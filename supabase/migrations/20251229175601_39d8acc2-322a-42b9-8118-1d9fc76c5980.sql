-- Update is_class_member function to use student_enrollments instead of class_members
-- This consolidates class membership logic to use one consistent table

CREATE OR REPLACE FUNCTION public.is_class_member(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Check if user is enrolled as a student in the class
  SELECT EXISTS (
    SELECT 1 FROM public.student_enrollments
    WHERE student_id = _user_id 
    AND class_id = _class_id 
    AND status = 'active'
  )
  -- Or check if user is the teacher of the class
  OR EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = _class_id 
    AND teacher_id = _user_id
  )
$$;

-- Add comment documenting the change
COMMENT ON FUNCTION public.is_class_member(uuid, uuid) IS 
'Checks if a user is a member of a class. Uses student_enrollments table for student membership and classes table for teacher membership. The class_members table is deprecated.';