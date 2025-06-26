
-- First ensure the Palavox District exists in the school_districts table
INSERT INTO public.school_districts (
  id, 
  name, 
  code, 
  created_at, 
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Palavox District',
  'PALAVOX',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Ensure the access code exists and is active
UPDATE public.access_codes 
SET active = true, current_uses = 0
WHERE code = 'DISTCALEB1';
