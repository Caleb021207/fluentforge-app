-- Create a default school if it doesn't exist
INSERT INTO public.schools (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Palavox Academy',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Generate a teacher access code
DO $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := generate_access_code(
    'teacher'::code_type,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Palavox Academy',
    NULL,
    NULL
  );
  
  RAISE NOTICE 'Teacher Access Code: %', new_code;
END $$;