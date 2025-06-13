-- Update the student profile that was missing school assignment
UPDATE public.profiles 
SET school_id = '1d0d9925-e0b7-40f8-8402-c57d0ad14400'
WHERE email = 'mr.suit008@gmail.com' AND role = 'student';