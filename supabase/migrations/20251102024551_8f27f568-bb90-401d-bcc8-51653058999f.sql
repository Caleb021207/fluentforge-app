-- Allow students to view classmate progression data for leaderboards
CREATE POLICY "Students can view classmate progression for leaderboards"
ON public.user_progression FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM student_enrollments se1
    JOIN student_enrollments se2 ON se1.class_id = se2.class_id
    WHERE se1.student_id = auth.uid()
    AND se2.student_id = user_progression.user_id
  )
);

-- Allow students to view public profile data of classmates
CREATE POLICY "Students can view classmate public profiles"
ON public.profile_public_data FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM student_enrollments se1
    JOIN student_enrollments se2 ON se1.class_id = se2.class_id
    WHERE se1.student_id = auth.uid()
    AND se2.student_id = profile_public_data.user_id
  )
);