-- Fix increment_tts_token_usage to use correct composite constraint
CREATE OR REPLACE FUNCTION public.increment_tts_token_usage(p_user_id uuid, p_tokens integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_academic_year TEXT;
BEGIN
  -- Calculate current academic year (September-August)
  current_academic_year := CASE
    WHEN EXTRACT(MONTH FROM NOW()) >= 9 THEN
      EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT
    ELSE
      (EXTRACT(YEAR FROM NOW()) - 1)::TEXT || '-' || EXTRACT(YEAR FROM NOW())::TEXT
  END;

  INSERT INTO student_usage_limits (student_id, academic_year, tts_tokens_used_current_month)
  VALUES (p_user_id, current_academic_year, p_tokens)
  ON CONFLICT (student_id, academic_year)
  DO UPDATE SET
    tts_tokens_used_current_month = student_usage_limits.tts_tokens_used_current_month + p_tokens,
    updated_at = now();
END;
$function$;

-- Fix increment_text_practice_token_usage to use correct composite constraint
CREATE OR REPLACE FUNCTION public.increment_text_practice_token_usage(p_user_id uuid, p_tokens integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_academic_year TEXT;
BEGIN
  -- Calculate current academic year (September-August)
  current_academic_year := CASE
    WHEN EXTRACT(MONTH FROM NOW()) >= 9 THEN
      EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT
    ELSE
      (EXTRACT(YEAR FROM NOW()) - 1)::TEXT || '-' || EXTRACT(YEAR FROM NOW())::TEXT
  END;

  INSERT INTO student_usage_limits (student_id, academic_year, text_practice_tokens_used_current_month)
  VALUES (p_user_id, current_academic_year, p_tokens)
  ON CONFLICT (student_id, academic_year)
  DO UPDATE SET
    text_practice_tokens_used_current_month = student_usage_limits.text_practice_tokens_used_current_month + p_tokens,
    updated_at = now();
END;
$function$;