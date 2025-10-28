-- Delete the orphaned "t-roy" class and its enrollments
-- This class has no teacher (teacher_id is NULL)

-- First, delete all enrollments for this class
DELETE FROM student_enrollments
WHERE class_id = '1dbb0e01-76a0-4b21-83dc-80340c2f80aa';

-- Then delete the class itself
DELETE FROM classes
WHERE id = '1dbb0e01-76a0-4b21-83dc-80340c2f80aa';

-- Also delete the access code for this class
DELETE FROM access_codes
WHERE target_id = '1dbb0e01-76a0-4b21-83dc-80340c2f80aa';