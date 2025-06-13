-- Fix school assignments with the correct school ID
-- Update Mr. Sales to be assigned to Palavox High School
UPDATE public.profiles 
SET school_id = '1d0d9925-e0b7-40f8-8402-c57d0ad14400'
WHERE display_name = 'Mr. Sales' AND role = 'teacher';

-- Update Mr. Sales Class to be assigned to Palavox High School  
UPDATE public.classes
SET school_id = '1d0d9925-e0b7-40f8-8402-c57d0ad14400'
WHERE name = 'Mr. Sales Class';