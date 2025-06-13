-- Fix school assignments for teacher and class visibility

-- First, get the Palavox High School ID and update Mr. Sales' profile
UPDATE public.profiles 
SET school_id = (
  SELECT id FROM public.schools WHERE name = 'Palavox High School' LIMIT 1
)
WHERE display_name = 'Mr. Sales' AND role = 'teacher';

-- Update Mr. Sales Class to be assigned to Palavox High School  
UPDATE public.classes
SET school_id = (
  SELECT id FROM public.schools WHERE name = 'Palavox High School' LIMIT 1
)
WHERE name = 'Mr. Sales Class';

-- Also update the teacher_id for the class to point to Mr. Sales
UPDATE public.classes
SET teacher_id = (
  SELECT id FROM public.profiles WHERE display_name = 'Mr. Sales' AND role = 'teacher' LIMIT 1
)
WHERE name = 'Mr. Sales Class' AND teacher_id IS NULL;