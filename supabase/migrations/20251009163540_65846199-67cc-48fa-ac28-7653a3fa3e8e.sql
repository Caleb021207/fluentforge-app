-- Add DELETE policy for teachers to remove students from their classes
CREATE POLICY "Teachers can remove students from their classes"
ON student_enrollments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = student_enrollments.class_id
    AND classes.teacher_id = auth.uid()
  )
);