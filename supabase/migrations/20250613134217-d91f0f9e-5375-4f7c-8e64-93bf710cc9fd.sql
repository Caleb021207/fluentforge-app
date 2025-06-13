-- Update student profiles to assign them to Palavox High School if they're missing school assignment
UPDATE public.profiles 
SET school_id = '1d0d9925-e0b7-40f8-8402-c57d0ad14400'
WHERE role = 'student' AND school_id IS NULL;