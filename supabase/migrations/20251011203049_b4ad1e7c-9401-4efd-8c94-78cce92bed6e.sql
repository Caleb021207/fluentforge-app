-- Add premium voice practice tracking columns to student_usage_limits
ALTER TABLE public.student_usage_limits
ADD COLUMN IF NOT EXISTS premium_voice_minutes_monthly_limit INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS premium_voice_minutes_used_current_month INTEGER DEFAULT 0;

-- Update reset_monthly_usage function to include premium voice minutes
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.student_usage_limits
  SET 
    voice_minutes_used_current_month = 0,
    text_messages_used_current_month = 0,
    premium_voice_minutes_used_current_month = 0,
    current_month = DATE_TRUNC('month', NOW()),
    last_reset_month = NOW(),
    updated_at = NOW()
  WHERE current_month < DATE_TRUNC('month', NOW());
END;
$function$;

-- Update can_start_voice_session to check premium voice limits
CREATE OR REPLACE FUNCTION public.can_start_premium_voice_session(target_student_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  usage_record RECORD;
  result JSON;
BEGIN
  -- Get usage limits
  SELECT * INTO usage_record
  FROM public.student_usage_limits
  WHERE student_id = target_student_id
    AND academic_year = EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT;
  
  IF NOT FOUND THEN
    -- Initialize if not exists
    PERFORM public.initialize_student_usage_limits(target_student_id);
    SELECT * INTO usage_record
    FROM public.student_usage_limits
    WHERE student_id = target_student_id
      AND academic_year = EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT;
  END IF;
  
  -- Check premium voice minutes limit
  IF usage_record.premium_voice_minutes_used_current_month >= usage_record.premium_voice_minutes_monthly_limit THEN
    result := json_build_object(
      'allowed', false,
      'reason', 'monthly_premium_voice_limit_reached',
      'minutes_used', usage_record.premium_voice_minutes_used_current_month,
      'minutes_limit', usage_record.premium_voice_minutes_monthly_limit
    );
    RETURN result;
  END IF;
  
  -- All checks passed
  result := json_build_object(
    'allowed', true,
    'minutes_remaining', usage_record.premium_voice_minutes_monthly_limit - usage_record.premium_voice_minutes_used_current_month,
    'minutes_used', usage_record.premium_voice_minutes_used_current_month,
    'minutes_limit', usage_record.premium_voice_minutes_monthly_limit
  );
  
  RETURN result;
END;
$function$;