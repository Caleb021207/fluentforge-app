
-- Insert the first district admin access code directly
INSERT INTO public.access_codes (
  code, 
  code_type, 
  target_id, 
  target_name, 
  created_by,
  created_at,
  updated_at,
  active,
  current_uses,
  max_uses,
  expires_at
) VALUES (
  'DIST123ABC',
  'district',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Palavox District',
  '5d15aec9-7c4e-44cc-a4e6-1a50b8d0a08e'::uuid,
  now(),
  now(),
  true,
  0,
  NULL,
  NULL
);

-- Verify the code was created
SELECT code, target_name, created_at 
FROM public.access_codes 
WHERE code = 'DIST123ABC';
