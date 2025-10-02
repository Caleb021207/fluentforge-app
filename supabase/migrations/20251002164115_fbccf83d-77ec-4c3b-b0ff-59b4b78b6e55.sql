-- Update CLSB4CBDD access code to point to the correct class
UPDATE public.access_codes
SET 
  target_id = 'd1603aff-f084-46fb-b66d-02cd9fc04997',
  target_name = 'Test Class - English',
  updated_at = now()
WHERE code = 'CLSB4CBDD';

-- Enroll all students into testaccount's class
INSERT INTO public.student_enrollments (student_id, class_id)
SELECT 
  p.id,
  'd1603aff-f084-46fb-b66d-02cd9fc04997'::uuid
FROM public.profiles p
WHERE p.role = 'student'
ON CONFLICT (student_id, class_id) DO NOTHING;

-- Update the access code usage count
UPDATE public.access_codes
SET current_uses = (
  SELECT COUNT(*)
  FROM public.student_enrollments
  WHERE class_id = 'd1603aff-f084-46fb-b66d-02cd9fc04997'
)
WHERE code = 'CLSB4CBDD';