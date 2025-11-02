-- Create function to check if user can use Azure TTS (token-based)
CREATE OR REPLACE FUNCTION public.can_use_azure_tts(p_student_id UUID)
RETURNS TABLE(can_use BOOLEAN, tokens_remaining INTEGER, tokens_limit INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (tts_tokens_used_current_month < tts_tokens_monthly_limit) as can_use,
    (tts_tokens_monthly_limit - tts_tokens_used_current_month) as tokens_remaining,
    tts_tokens_monthly_limit as tokens_limit
  FROM student_usage_limits
  WHERE student_id = p_student_id;
END;
$$;

-- Create function to check if user can use Whisper STT (minute-based)
CREATE OR REPLACE FUNCTION public.can_use_whisper_stt(p_student_id UUID)
RETURNS TABLE(can_use BOOLEAN, minutes_remaining INTEGER, minutes_limit INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (voice_minutes_used_current_month < voice_minutes_monthly_limit) as can_use,
    (voice_minutes_monthly_limit - voice_minutes_used_current_month) as minutes_remaining,
    voice_minutes_monthly_limit as minutes_limit
  FROM student_usage_limits
  WHERE student_id = p_student_id;
END;
$$;