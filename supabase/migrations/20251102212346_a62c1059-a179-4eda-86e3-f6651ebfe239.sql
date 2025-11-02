-- Fix increment_text_practice_token_usage to use correct column name (student_id instead of user_id)
CREATE OR REPLACE FUNCTION public.increment_text_practice_token_usage(p_user_id UUID, p_tokens INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO student_usage_limits (student_id, text_practice_tokens_used_current_month)
  VALUES (p_user_id, p_tokens)
  ON CONFLICT (student_id)
  DO UPDATE SET
    text_practice_tokens_used_current_month = student_usage_limits.text_practice_tokens_used_current_month + p_tokens,
    updated_at = now();
END;
$$;

-- Fix increment_tts_token_usage to use correct column name (student_id instead of user_id)
CREATE OR REPLACE FUNCTION public.increment_tts_token_usage(p_user_id UUID, p_tokens INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO student_usage_limits (student_id, tts_tokens_used_current_month)
  VALUES (p_user_id, p_tokens)
  ON CONFLICT (student_id)
  DO UPDATE SET
    tts_tokens_used_current_month = student_usage_limits.tts_tokens_used_current_month + p_tokens,
    updated_at = now();
END;
$$;