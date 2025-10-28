-- Add RLS policy to allow students to see other students in their classes
-- This is needed for the class leaderboard functionality

CREATE POLICY "Students can view classmates in shared classes"
ON public.student_enrollments
FOR SELECT
TO authenticated
USING (
  -- Students can see other students enrolled in the same classes they're in
  EXISTS (
    SELECT 1 
    FROM student_enrollments my_enrollments
    WHERE my_enrollments.student_id = auth.uid()
      AND my_enrollments.class_id = student_enrollments.class_id
      AND my_enrollments.status = 'active'
  )
);