-- Fix reset_monthly_usage function to properly handle nested declaration
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
BEGIN
  -- Reset monthly counters
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
$function$;