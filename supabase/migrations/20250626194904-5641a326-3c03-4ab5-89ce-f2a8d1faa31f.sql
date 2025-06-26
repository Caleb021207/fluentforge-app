
-- Generate a new district access code for Palavox District
INSERT INTO public.access_codes (
  code, 
  code_type, 
  target_id, 
  target_name, 
  created_by, 
  active,
  current_uses,
  max_uses
) VALUES (
  'DIST' || upper(substring(md5(random()::text) from 1 for 6)),
  'district',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Palavox District',
  '5d15aec9-7c4e-44cc-a4e6-1a50b8d0a08e'::uuid,
  true,
  0,
  null
);

-- Show the generated code
SELECT code FROM public.access_codes 
WHERE code_type = 'district' 
AND target_name = 'Palavox District' 
AND active = true 
ORDER BY created_at DESC 
LIMIT 1;
