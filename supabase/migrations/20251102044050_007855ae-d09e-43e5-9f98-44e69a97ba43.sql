-- Create account_tier enum
CREATE TYPE public.account_tier AS ENUM ('standard', 'premium');

-- Add account_tier column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN account_tier public.account_tier DEFAULT 'premium';

-- Set all existing users to premium tier
UPDATE public.profiles SET account_tier = 'premium' WHERE account_tier IS NULL;

-- Insert predefined access codes for tiers
INSERT INTO public.access_codes (code, code_type, target_id, target_name, active, metadata, created_by, max_uses)
VALUES 
  ('02122007', 'class', gen_random_uuid(), 'Standard Tier Users', true, 
   '{"account_tier": "standard", "description": "Standard subscription - $2.57/student/month"}'::jsonb, 
   (SELECT id FROM auth.users LIMIT 1), NULL),
  ('08132010', 'class', gen_random_uuid(), 'Premium Tier Users', true,
   '{"account_tier": "premium", "description": "Premium subscription - $4.02/student/month"}'::jsonb,
   (SELECT id FROM auth.users LIMIT 1), NULL);

-- Update process_access_code function to handle account_tier assignment
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
  tier_to_assign account_tier;
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
  
  -- Determine account tier from metadata if present
  IF code_record.metadata ? 'account_tier' THEN
    tier_to_assign := (code_record.metadata->>'account_tier')::account_tier;
  ELSE
    tier_to_assign := 'premium'::account_tier;
  END IF;
  
  -- Process based on code type
  CASE code_record.code_type
    WHEN 'district' THEN
      -- Create or update user profile
      INSERT INTO public.profiles (id, email, display_name, account_tier, created_at, updated_at)
      VALUES (auth.uid(), user_email, user_email, tier_to_assign, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        email = COALESCE(profiles.email, user_email),
        account_tier = tier_to_assign,
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
        'assignment', code_record.target_name,
        'account_tier', tier_to_assign
      );
      
    WHEN 'school' THEN
      -- Check if school exists
      SELECT EXISTS(SELECT 1 FROM public.schools WHERE id = code_record.target_id) INTO school_exists;
      
      IF NOT school_exists THEN
        INSERT INTO public.schools (id, name, created_at, updated_at)
        VALUES (code_record.target_id, code_record.target_name, now(), now())
        ON CONFLICT (id) DO NOTHING;
      END IF;
      
      -- Create or update user profile
      INSERT INTO public.profiles (id, school_id, email, display_name, account_tier, created_at, updated_at)
      VALUES (auth.uid(), code_record.target_id, user_email, user_email, tier_to_assign, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        school_id = code_record.target_id,
        email = COALESCE(profiles.email, user_email),
        account_tier = tier_to_assign,
        updated_at = now();
      
      -- Assign role via user_roles table
      INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      result := json_build_object(
        'success', true,
        'message', 'You are now a school administrator for ' || code_record.target_name,
        'role', 'admin',
        'assignment', code_record.target_name,
        'account_tier', tier_to_assign
      );
      
    WHEN 'teacher' THEN
      -- Check if school exists
      SELECT EXISTS(SELECT 1 FROM public.schools WHERE id = code_record.target_id) INTO school_exists;
      
      IF NOT school_exists THEN
        INSERT INTO public.schools (id, name, created_at, updated_at)
        VALUES (code_record.target_id, code_record.target_name, now(), now())
        ON CONFLICT (id) DO NOTHING;
      END IF;
      
      -- Create or update user profile
      INSERT INTO public.profiles (id, school_id, email, display_name, account_tier, created_at, updated_at)
      VALUES (auth.uid(), code_record.target_id, user_email, user_email, tier_to_assign, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        school_id = code_record.target_id,
        email = COALESCE(profiles.email, user_email),
        account_tier = tier_to_assign,
        updated_at = now();
      
      -- Assign role via user_roles table
      INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'teacher'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      result := json_build_object(
        'success', true,
        'message', 'You are now a teacher at ' || code_record.target_name,
        'role', 'teacher',
        'assignment', code_record.target_name,
        'account_tier', tier_to_assign
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
      
      -- Create or update user profile with account tier
      INSERT INTO public.profiles (id, email, display_name, account_tier, created_at, updated_at)
      VALUES (auth.uid(), user_email, user_email, tier_to_assign, now(), now())
      ON CONFLICT (id) DO UPDATE SET 
        email = COALESCE(profiles.email, user_email),
        account_tier = tier_to_assign,
        updated_at = now();
      
      -- Assign role via user_roles table
      INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'student'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      -- Enroll student in class
      INSERT INTO public.student_enrollments (student_id, class_id)
      VALUES (auth.uid(), code_record.target_id)
      ON CONFLICT (student_id, class_id) DO NOTHING;
      
      -- Initialize usage limits with tier-specific values
      PERFORM public.initialize_student_usage_limits_with_tier(auth.uid(), tier_to_assign);
      
      result := json_build_object(
        'success', true,
        'message', 'You have been enrolled in ' || code_record.target_name,
        'role', 'student',
        'assignment', code_record.target_name,
        'account_tier', tier_to_assign
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
      'target_name', code_record.target_name,
      'account_tier', tier_to_assign
    ),
    true
  );
  
  RETURN result;
END;
$function$;

-- Create function to initialize student usage limits with tier-specific values
CREATE OR REPLACE FUNCTION public.initialize_student_usage_limits_with_tier(
  p_student_id UUID,
  p_account_tier account_tier
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_academic_year TEXT;
  tts_limit INTEGER;
  text_practice_limit INTEGER;
  whisper_limit INTEGER;
  realtime_limit INTEGER;
BEGIN
  current_academic_year := EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT;
  
  -- Set limits based on account tier
  IF p_account_tier = 'standard' THEN
    tts_limit := 360000;           -- 22.5K tokens × 16 = 360K
    text_practice_limit := 150000;  -- 150K tokens
    whisper_limit := 120;           -- 120 minutes
    realtime_limit := 0;            -- 0 minutes (disabled)
  ELSE -- premium
    tts_limit := 540000;            -- 33.75K tokens × 16 = 540K
    text_practice_limit := 300000;  -- 300K tokens
    whisper_limit := 180;           -- 180 minutes
    realtime_limit := 15;           -- 15 minutes
  END IF;
  
  INSERT INTO public.student_usage_limits (
    user_id,
    academic_year,
    tts_tokens_monthly_limit,
    text_practice_tokens_monthly_limit,
    voice_minutes_monthly_limit,
    premium_voice_minutes_monthly_limit
  )
  VALUES (
    p_student_id,
    current_academic_year,
    tts_limit,
    text_practice_limit,
    whisper_limit,
    realtime_limit
  )
  ON CONFLICT (user_id, academic_year) 
  DO UPDATE SET
    tts_tokens_monthly_limit = EXCLUDED.tts_tokens_monthly_limit,
    text_practice_tokens_monthly_limit = EXCLUDED.text_practice_tokens_monthly_limit,
    voice_minutes_monthly_limit = EXCLUDED.voice_minutes_monthly_limit,
    premium_voice_minutes_monthly_limit = EXCLUDED.premium_voice_minutes_monthly_limit,
    updated_at = NOW();
END;
$function$;

-- Update reset_monthly_usage to respect account tiers
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.student_usage_limits sul
  SET 
    voice_minutes_used_current_month = 0,
    premium_voice_minutes_used_current_month = 0,
    tts_tokens_used_current_month = 0,
    text_practice_tokens_used_current_month = 0,
    current_month = DATE_TRUNC('month', NOW()),
    last_reset_month = NOW(),
    updated_at = NOW()
  WHERE current_month < DATE_TRUNC('month', NOW());
  
  -- Reinitialize limits based on current tier for all users
  DECLARE
    user_record RECORD;
  BEGIN
    FOR user_record IN 
      SELECT p.id, p.account_tier 
      FROM public.profiles p
      WHERE p.account_tier IS NOT NULL
    LOOP
      PERFORM public.initialize_student_usage_limits_with_tier(
        user_record.id, 
        user_record.account_tier
      );
    END LOOP;
  END;
END;
$function$;