-- Add token-based limits to student_usage_limits table
ALTER TABLE student_usage_limits
ADD COLUMN IF NOT EXISTS tts_tokens_monthly_limit INTEGER DEFAULT 1000000,
ADD COLUMN IF NOT EXISTS tts_tokens_used_current_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS text_practice_tokens_monthly_limit INTEGER DEFAULT 2000000,
ADD COLUMN IF NOT EXISTS text_practice_tokens_used_current_month INTEGER DEFAULT 0;

-- Update the reset_monthly_usage function to include tokens
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.student_usage_limits
  SET 
    voice_minutes_used_current_month = 0,
    premium_voice_minutes_used_current_month = 0,
    tts_tokens_used_current_month = 0,
    text_practice_tokens_used_current_month = 0,
    current_month = DATE_TRUNC('month', NOW()),
    last_reset_month = NOW(),
    updated_at = NOW()
  WHERE current_month < DATE_TRUNC('month', NOW());
END;
$$;

-- Create function to increment TTS token usage
CREATE OR REPLACE FUNCTION public.increment_tts_token_usage(p_user_id UUID, p_tokens INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO student_usage_limits (user_id, tts_tokens_used_current_month)
  VALUES (p_user_id, p_tokens)
  ON CONFLICT (user_id)
  DO UPDATE SET
    tts_tokens_used_current_month = student_usage_limits.tts_tokens_used_current_month + p_tokens,
    updated_at = now();
END;
$$;

-- Create function to increment text practice token usage
CREATE OR REPLACE FUNCTION public.increment_text_practice_token_usage(p_user_id UUID, p_tokens INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO student_usage_limits (user_id, text_practice_tokens_used_current_month)
  VALUES (p_user_id, p_tokens)
  ON CONFLICT (user_id)
  DO UPDATE SET
    text_practice_tokens_used_current_month = student_usage_limits.text_practice_tokens_used_current_month + p_tokens,
    updated_at = now();
END;
$$;