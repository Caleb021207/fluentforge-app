-- Fix Critical Security Issues

-- 1. Add RLS policies to api_calls_tracking table to prevent data exposure
CREATE POLICY "Users can view their own API call tracking" 
ON public.api_calls_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API call tracking" 
ON public.api_calls_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Update database functions to include proper search_path protection
CREATE OR REPLACE FUNCTION public.process_access_code(p_code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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
$function$;

CREATE OR REPLACE FUNCTION public.change_user_role_for_testing(target_role text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_user_id uuid;
  result json;
BEGIN
  -- Get the current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  -- Validate the target role
  IF target_role NOT IN ('student', 'teacher', 'admin', 'district') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid role. Must be one of: student, teacher, admin, district'
    );
  END IF;

  -- Update the user's role
  UPDATE public.profiles 
  SET role = target_role, updated_at = now()
  WHERE id = current_user_id;

  -- Check if the update was successful
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Role successfully changed to ' || target_role
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Profile not found or update failed'
    );
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_phrases(p_level text, p_language text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Delete phrases beyond the 15 most recent for this level/language combination
  DELETE FROM public.recent_phrases
  WHERE id IN (
    SELECT id
    FROM public.recent_phrases
    WHERE level = p_level AND language = p_language
    ORDER BY created_at DESC
    OFFSET 15
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.recalculate_student_metrics(target_student_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Call the existing function
  PERFORM public.update_student_language_aggregate_metrics(target_student_id);
  
  -- Update last_activity
  UPDATE public.student_metrics
  SET last_activity = now()
  WHERE student_id = target_student_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_classroom(class_name text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  new_code TEXT;
  classroom_record RECORD;
BEGIN
  -- Generate a unique 6-character code
  new_code := upper(substring(md5(random()::text) from 1 for 6));
  
  -- Ensure code is unique
  WHILE EXISTS (SELECT 1 FROM public.classroom_codes WHERE code = new_code) LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 6));
  END LOOP;
  
  -- Insert the new classroom
  INSERT INTO public.classroom_codes (teacher_id, class_name, code)
  VALUES (auth.uid(), class_name, new_code)
  RETURNING * INTO classroom_record;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Class created successfully',
    'classroom_id', classroom_record.id,
    'class_code', classroom_record.code,
    'class_name', classroom_record.class_name
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_student_language_aggregate_metrics(target_student_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  avg_grammar NUMERIC;
  avg_complexity NUMERIC;
  metrics_count INTEGER;
BEGIN
  SELECT 
    COALESCE(AVG(grammar_accuracy), 0),
    COALESCE(AVG(conversation_complexity), 0),
    COUNT(*)
  INTO 
    avg_grammar,
    avg_complexity,
    metrics_count
  FROM public.student_language_metrics
  WHERE user_id = target_student_id;

  UPDATE public.student_metrics
  SET 
    avg_grammar_accuracy = avg_grammar,
    avg_conversation_complexity = avg_complexity,
    language_metrics_count = metrics_count
  WHERE student_id = target_student_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.student_metrics (
      student_id,
      avg_grammar_accuracy,
      avg_conversation_complexity,
      language_metrics_count
    )
    VALUES (
      target_student_id,
      avg_grammar,
      avg_complexity,
      metrics_count
    );
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.join_classroom(class_code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  classroom_record RECORD;
  existing_membership RECORD;
BEGIN
  -- Find the classroom by code
  SELECT * INTO classroom_record
  FROM public.classroom_codes
  WHERE code = class_code AND active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid or inactive class code'
    );
  END IF;
  
  -- Check if user is already a member
  SELECT * INTO existing_membership
  FROM public.classroom_memberships
  WHERE classroom_id = classroom_record.id AND student_id = auth.uid();
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'You are already a member of this class'
    );
  END IF;
  
  -- Add the user to the classroom
  INSERT INTO public.classroom_memberships (classroom_id, student_id)
  VALUES (classroom_record.id, auth.uid());
  
  RETURN json_build_object(
    'success', true,
    'message', 'Successfully joined ' || classroom_record.class_name,
    'classroom_id', classroom_record.id,
    'class_name', classroom_record.class_name
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_access_code(p_code_type code_type, p_target_id uuid, p_target_name text, p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_max_uses integer DEFAULT NULL::integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  new_code TEXT;
  prefix TEXT;
BEGIN
  -- Set prefix based on code type
  CASE p_code_type
    WHEN 'district' THEN prefix := 'DIST';
    WHEN 'school' THEN prefix := 'SCH';
    WHEN 'teacher' THEN prefix := 'TCH';
    WHEN 'class' THEN prefix := 'CLS';
  END CASE;
  
  -- Generate unique code
  LOOP
    new_code := prefix || upper(substring(md5(random()::text) from 1 for 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.access_codes WHERE code = new_code);
  END LOOP;
  
  -- Insert the new code
  INSERT INTO public.access_codes (
    code, code_type, target_id, target_name, created_by, expires_at, max_uses
  ) VALUES (
    new_code, p_code_type, p_target_id, p_target_name, auth.uid(), p_expires_at, p_max_uses
  );
  
  RETURN new_code;
END;
$function$;