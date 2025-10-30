-- Fix process_access_code to use user_roles table instead of profiles.role
-- This aligns with the secure role architecture documented in the codebase

-- Drop and recreate the function to use user_roles table
CREATE OR REPLACE FUNCTION public.process_access_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  -- Rate limit check
  IF NOT public.check_access_code_rate_limit(auth.uid(), NULL, 5, 60) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Too many access code attempts. Please try again later.'
    );
  END IF;

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
      -- Create or update user profile (NO ROLE ASSIGNMENT)
      INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
      VALUES (auth.uid(), user_email, user_email, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        email = COALESCE(profiles.email, user_email),
        updated_at = now();
      
      -- Assign role via user_roles table
      INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'district'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
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
        INSERT INTO public.schools (id, name, created_at, updated_at)
        VALUES (code_record.target_id, code_record.target_name, now(), now())
        ON CONFLICT (id) DO NOTHING;
      END IF;
      
      -- Create or update user profile (NO ROLE ASSIGNMENT)
      INSERT INTO public.profiles (id, school_id, email, display_name, created_at, updated_at)
      VALUES (auth.uid(), code_record.target_id, user_email, user_email, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        school_id = code_record.target_id,
        email = COALESCE(profiles.email, user_email),
        updated_at = now();
      
      -- Assign role via user_roles table
      INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
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
        INSERT INTO public.schools (id, name, created_at, updated_at)
        VALUES (code_record.target_id, code_record.target_name, now(), now())
        ON CONFLICT (id) DO NOTHING;
      END IF;
      
      -- Create or update user profile (NO ROLE ASSIGNMENT)
      INSERT INTO public.profiles (id, school_id, email, display_name, created_at, updated_at)
      VALUES (auth.uid(), code_record.target_id, user_email, user_email, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        school_id = code_record.target_id,
        email = COALESCE(profiles.email, user_email),
        updated_at = now();
      
      -- Assign role via user_roles table
      INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'teacher'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
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
          substring(code_record.code from 4),
          extract(year from now())::text || '-' || (extract(year from now()) + 1)::text,
          now(), 
          now()
        );
      END IF;
      
      -- Create or update user profile (NO ROLE ASSIGNMENT)
      INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
      VALUES (auth.uid(), user_email, user_email, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        email = COALESCE(profiles.email, user_email),
        updated_at = now();
      
      -- Assign role via user_roles table
      INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'student'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
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
  
  -- Log the access code redemption for security audit
  INSERT INTO public.security_audit_log (user_id, action, details, success)
  VALUES (
    auth.uid(),
    'access_code_redeemed',
    json_build_object(
      'code_type', code_record.code_type,
      'target_id', code_record.target_id,
      'target_name', code_record.target_name
    ),
    true
  );
  
  RETURN result;
END;
$function$;