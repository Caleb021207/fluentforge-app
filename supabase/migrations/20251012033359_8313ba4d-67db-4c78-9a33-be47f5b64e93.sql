-- Update the aggregation function to include premium voice practice
CREATE OR REPLACE FUNCTION public.update_student_usage_aggregates(target_student_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_month_start DATE;
  current_semester TEXT;
  voice_minutes_used INTEGER;
  premium_voice_minutes_used INTEGER;
  text_messages_used INTEGER;
  cert_attempts_used INTEGER;
BEGIN
  -- Calculate current month and semester
  current_month_start := DATE_TRUNC('month', NOW());
  current_semester := CASE 
    WHEN EXTRACT(MONTH FROM NOW()) >= 1 AND EXTRACT(MONTH FROM NOW()) <= 6 THEN 'spring'
    ELSE 'fall'
  END;

  -- Aggregate voice minutes from usage_tracking for current month
  SELECT COALESCE(SUM(minutes_used), 0)
  INTO voice_minutes_used
  FROM public.usage_tracking
  WHERE student_id = target_student_id
    AND session_type = 'voice_practice'
    AND DATE_TRUNC('month', created_at) = current_month_start;

  -- Aggregate PREMIUM voice minutes from usage_tracking for current month
  SELECT COALESCE(SUM(minutes_used), 0)
  INTO premium_voice_minutes_used
  FROM public.usage_tracking
  WHERE student_id = target_student_id
    AND session_type = 'premium_voice_practice'
    AND DATE_TRUNC('month', created_at) = current_month_start;

  -- Aggregate text messages from usage_tracking for current month
  SELECT COALESCE(SUM(messages_count), 0)
  INTO text_messages_used
  FROM public.usage_tracking
  WHERE student_id = target_student_id
    AND session_type = 'text_practice'
    AND DATE_TRUNC('month', created_at) = current_month_start;

  -- Aggregate certification attempts for current semester
  SELECT COALESCE(COUNT(*), 0)
  INTO cert_attempts_used
  FROM public.usage_tracking
  WHERE student_id = target_student_id
    AND session_type = 'certification'
    AND (
      (current_semester = 'spring' AND EXTRACT(MONTH FROM created_at) BETWEEN 1 AND 6) OR
      (current_semester = 'fall' AND EXTRACT(MONTH FROM created_at) BETWEEN 7 AND 12)
    )
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  -- Update or insert into student_usage_limits
  INSERT INTO public.student_usage_limits (
    student_id,
    voice_minutes_used_current_month,
    premium_voice_minutes_used_current_month,
    text_messages_used_current_month,
    certification_attempts_used_current_semester,
    current_month,
    current_semester,
    academic_year
  )
  VALUES (
    target_student_id,
    voice_minutes_used,
    premium_voice_minutes_used,
    text_messages_used,
    cert_attempts_used,
    current_month_start,
    current_semester,
    EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT
  )
  ON CONFLICT (student_id, academic_year) 
  DO UPDATE SET
    voice_minutes_used_current_month = EXCLUDED.voice_minutes_used_current_month,
    premium_voice_minutes_used_current_month = EXCLUDED.premium_voice_minutes_used_current_month,
    text_messages_used_current_month = EXCLUDED.text_messages_used_current_month,
    certification_attempts_used_current_semester = EXCLUDED.certification_attempts_used_current_semester,
    current_month = EXCLUDED.current_month,
    current_semester = EXCLUDED.current_semester,
    updated_at = NOW();
END;
$function$;

-- Update the trigger to handle premium voice practice
CREATE OR REPLACE FUNCTION public.trigger_usage_aggregation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Aggregate for voice_practice, premium_voice_practice, text_practice, and certification
  IF NEW.session_type IN ('voice_practice', 'premium_voice_practice', 'text_practice', 'certification') THEN
    PERFORM public.update_student_usage_aggregates(NEW.student_id);
  END IF;
  
  RETURN NEW;
END;
$function$;