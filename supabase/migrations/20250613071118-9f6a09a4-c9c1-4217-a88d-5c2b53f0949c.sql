
-- Fix the process_access_code function to properly handle class creation
CREATE OR REPLACE FUNCTION public.process_access_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  code_record RECORD;
  result JSON;
  user_email TEXT;
  school_exists BOOLEAN;
  class_exists BOOLEAN;
  default_school_id UUID;
  created_school_id UUID;
BEGIN
  -- Find and validate the code
  SELECT * INTO code_record
  FROM public.access_codes
  WHERE code = upper(p_code) 
    AND active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses);
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid, expired, or used up access code'
    );
  END IF;
  
  -- Get user email from auth.users for profile creation
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Process based on code type
  CASE code_record.code_type
    WHEN 'district' THEN
      -- Create or update user profile as district admin
      INSERT INTO public.profiles (id, role, email, display_name, created_at, updated_at)
      VALUES (auth.uid(), 'district', user_email, user_email, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        role = 'district',
        email = COALESCE(profiles.email, user_email),
        updated_at = now();
      
      -- Add to district_users table
      INSERT INTO public.district_users (user_id, district_id, role)
      VALUES (auth.uid(), code_record.target_id, 'admin')
      ON CONFLICT (user_id, district_id) DO UPDATE SET role = 'admin';
      
      result := json_build_object(
        'success', true,
        'message', 'You are now a district administrator for ' || code_record.target_name,
        'role', 'district',
        'assignment', code_record.target_name
      );
      
    WHEN 'school' THEN
      -- Check if school exists
      SELECT EXISTS(SELECT 1 FROM public.schools WHERE id = code_record.target_id) INTO school_exists;
      
      IF NOT school_exists THEN
        -- Create the school if it doesn't exist
        INSERT INTO public.schools (id, name, created_at, updated_at)
        VALUES (code_record.target_id, code_record.target_name, now(), now())
        ON CONFLICT (id) DO NOTHING;
      END IF;
      
      -- Create or update user profile as school admin
      INSERT INTO public.profiles (id, role, school_id, email, display_name, created_at, updated_at)
      VALUES (auth.uid(), 'admin', code_record.target_id, user_email, user_email, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        role = 'admin',
        school_id = code_record.target_id,
        email = COALESCE(profiles.email, user_email),
        updated_at = now();
      
      result := json_build_object(
        'success', true,
        'message', 'You are now a school administrator for ' || code_record.target_name,
        'role', 'admin',
        'assignment', code_record.target_name
      );
      
    WHEN 'teacher' THEN
      -- Check if school exists
      SELECT EXISTS(SELECT 1 FROM public.schools WHERE id = code_record.target_id) INTO school_exists;
      
      IF NOT school_exists THEN
        -- Create the school if it doesn't exist
        INSERT INTO public.schools (id, name, created_at, updated_at)
        VALUES (code_record.target_id, code_record.target_name, now(), now())
        ON CONFLICT (id) DO NOTHING;
      END IF;
      
      -- Create or update user profile as teacher
      INSERT INTO public.profiles (id, role, school_id, email, display_name, created_at, updated_at)
      VALUES (auth.uid(), 'teacher', code_record.target_id, user_email, user_email, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        role = 'teacher',
        school_id = code_record.target_id,
        email = COALESCE(profiles.email, user_email),
        updated_at = now();
      
      result := json_build_object(
        'success', true,
        'message', 'You are now a teacher at ' || code_record.target_name,
        'role', 'teacher',
        'assignment', code_record.target_name
      );
      
    WHEN 'class' THEN
      -- Check if class exists
      SELECT EXISTS(SELECT 1 FROM public.classes WHERE id = code_record.target_id) INTO class_exists;
      
      IF NOT class_exists THEN
        -- First, ensure we have a school to put the class in
        SELECT id INTO default_school_id FROM public.schools LIMIT 1;
        
        -- If no school exists, create a default one
        IF default_school_id IS NULL THEN
          INSERT INTO public.schools (id, name, created_at, updated_at)
          VALUES (gen_random_uuid(), 'Default School', now(), now())
          RETURNING id INTO created_school_id;
          default_school_id := created_school_id;
        END IF;
        
        -- Create the class
        INSERT INTO public.classes (id, name, school_id, class_code, academic_year, created_at, updated_at)
        VALUES (
          code_record.target_id, 
          code_record.target_name, 
          default_school_id,
          substring(code_record.code from 4), -- Remove CLS prefix for class_code
          extract(year from now())::text || '-' || (extract(year from now()) + 1)::text,
          now(), 
          now()
        );
      END IF;
      
      -- Create or update user profile as student (BEFORE enrolling in class)
      INSERT INTO public.profiles (id, role, email, display_name, created_at, updated_at)
      VALUES (auth.uid(), 'student', user_email, user_email, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        role = COALESCE(NULLIF(profiles.role, ''), 'student'),
        email = COALESCE(profiles.email, user_email),
        updated_at = now();
      
      -- Enroll student in class
      INSERT INTO public.student_enrollments (student_id, class_id)
      VALUES (auth.uid(), code_record.target_id)
      ON CONFLICT (student_id, class_id) DO NOTHING;
      
      result := json_build_object(
        'success', true,
        'message', 'You have been enrolled in ' || code_record.target_name,
        'role', 'student',
        'assignment', code_record.target_name
      );
  END CASE;
  
  -- Update usage count
  UPDATE public.access_codes 
  SET current_uses = current_uses + 1, updated_at = now()
  WHERE id = code_record.id;
  
  RETURN result;
END;
$function$
