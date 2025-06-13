-- Clean up duplicate districts and properly assign school to district

-- First, get the IDs we need to work with
DO $$
DECLARE
  palavox_district_id UUID := 'b8f3e7d2-9c4a-4b5e-8f2d-1a7c9e5b3d8f';
  palavox_school_id UUID;
  caleb_user_id UUID;
BEGIN
  -- Get Palavox High School ID
  SELECT id INTO palavox_school_id 
  FROM public.schools 
  WHERE name = 'Palavox High School' 
  LIMIT 1;
  
  -- Get Caleb's user ID (district admin)
  SELECT id INTO caleb_user_id 
  FROM public.profiles 
  WHERE role = 'district' 
  LIMIT 1;
  
  -- Clean up any old districts that aren't the Palavox School District
  DELETE FROM public.district_users 
  WHERE district_id != palavox_district_id;
  
  DELETE FROM public.school_districts 
  WHERE id != palavox_district_id;
  
  -- Ensure Palavox High School is assigned to the correct district
  UPDATE public.schools 
  SET district_id = palavox_district_id,
      updated_at = now()
  WHERE id = palavox_school_id;
  
  -- Ensure Caleb is properly assigned to the district as admin
  INSERT INTO public.district_users (user_id, district_id, role, consent_provided, created_at, updated_at)
  VALUES (caleb_user_id, palavox_district_id, 'admin', true, now(), now())
  ON CONFLICT (user_id, district_id) DO UPDATE SET 
    role = 'admin',
    consent_provided = true,
    updated_at = now();
    
  RAISE NOTICE 'Cleaned up districts and assigned Palavox High School (%) to Palavox School District (%) for user (%)', 
    palavox_school_id, palavox_district_id, caleb_user_id;
END $$;