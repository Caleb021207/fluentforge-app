
-- 1. Create a district record first
INSERT INTO public.school_districts (id, name, code, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Palavox District',
  'PALAVOX',
  now(),
  now()
);

-- 2. Create/update your profile record with district role
INSERT INTO public.profiles (
  id, 
  display_name, 
  role, 
  email,
  created_at, 
  updated_at
)
VALUES (
  '5d15aec9-7c4e-44cc-a4e6-1a50b8d0a08e'::uuid,
  'Caleb',
  'district',
  'caleb@palavox.org',
  now(),
  now()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'district',
  email = 'caleb@palavox.org',
  display_name = COALESCE(profiles.display_name, 'Caleb'),
  updated_at = now();

-- 3. Link you to the district as an admin (simple insert)
INSERT INTO public.district_users (user_id, district_id, role, consent_provided, created_at, updated_at)
VALUES (
  '5d15aec9-7c4e-44cc-a4e6-1a50b8d0a08e'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'admin',
  true,
  now(),
  now()
);
