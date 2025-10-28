-- Clean up any orphaned student enrollments where the class no longer exists
-- This handles any edge cases where the cascade deletion didn't work

DELETE FROM student_enrollments
WHERE class_id NOT IN (SELECT id FROM classes);

-- Add a constraint to prevent orphaned enrollments in the future
-- This ensures referential integrity
ALTER TABLE student_enrollments 
DROP CONSTRAINT IF EXISTS student_enrollments_class_id_fkey;

ALTER TABLE student_enrollments
ADD CONSTRAINT student_enrollments_class_id_fkey
FOREIGN KEY (class_id)
REFERENCES classes(id)
ON DELETE CASCADE;

-- Also ensure student_id foreign key has cascade delete
ALTER TABLE student_enrollments
DROP CONSTRAINT IF EXISTS student_enrollments_student_id_fkey;

ALTER TABLE student_enrollments
ADD CONSTRAINT student_enrollments_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;