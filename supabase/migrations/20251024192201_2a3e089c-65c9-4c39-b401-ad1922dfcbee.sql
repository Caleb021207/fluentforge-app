-- Create RPC functions for tracking TTS and STT usage

CREATE OR REPLACE FUNCTION increment_tts_usage(p_student_id UUID, p_minutes INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE student_usage_limits
  SET tts_minutes_used_current_month = tts_minutes_used_current_month + p_minutes
  WHERE student_id = p_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION increment_stt_usage(p_student_id UUID, p_minutes INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE student_usage_limits
  SET stt_minutes_used_current_month = stt_minutes_used_current_month + p_minutes
  WHERE student_id = p_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;