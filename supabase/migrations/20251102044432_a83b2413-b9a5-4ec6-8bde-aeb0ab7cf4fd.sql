-- Fix initialize_student_usage_limits_with_tier to use correct column name (student_id not user_id)
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
    student_id,
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
  ON CONFLICT (student_id, academic_year) 
  DO UPDATE SET
    tts_tokens_monthly_limit = EXCLUDED.tts_tokens_monthly_limit,
    text_practice_tokens_monthly_limit = EXCLUDED.text_practice_tokens_monthly_limit,
    voice_minutes_monthly_limit = EXCLUDED.voice_minutes_monthly_limit,
    premium_voice_minutes_monthly_limit = EXCLUDED.premium_voice_minutes_monthly_limit,
    updated_at = NOW();
END;
$function$;