-- Create a district for the organization
INSERT INTO public.school_districts (id, name, code, created_at, updated_at)
VALUES (
  'b8f3e7d2-9c4a-4b5e-8f2d-1a7c9e5b3d8f',
  'Palavox School District',
  'PSD001',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Assign Caleb (the district admin user) to the district
-- First, get the current district admin user ID (assuming it's the current authenticated user)
INSERT INTO public.district_users (user_id, district_id, role, consent_provided, created_at, updated_at)
SELECT 
  p.id,
  'b8f3e7d2-9c4a-4b5e-8f2d-1a7c9e5b3d8f',
  'admin',
  true,
  now(),
  now()
FROM public.profiles p
WHERE p.role = 'district'
ON CONFLICT (user_id, district_id) DO UPDATE SET 
  role = 'admin',
  updated_at = now();

-- Assign Palavox High School to the district
UPDATE public.schools 
SET district_id = 'b8f3e7d2-9c4a-4b5e-8f2d-1a7c9e5b3d8f',
    updated_at = now()
WHERE name = 'Palavox High School';

-- Create a function to get district schools with proper filtering
CREATE OR REPLACE FUNCTION public.get_user_district_ids(target_user_id UUID)
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT district_id 
    FROM public.district_users 
    WHERE user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;