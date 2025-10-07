-- Set all profiles to student role
UPDATE public.profiles
SET role = 'student', updated_at = now();

-- Set testaccount@palavox.org as teacher
UPDATE public.profiles
SET role = 'teacher', updated_at = now()
WHERE email = 'testaccount@palavox.org';