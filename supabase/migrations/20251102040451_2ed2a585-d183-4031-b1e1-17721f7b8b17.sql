-- Create function to increment voice practice minutes
CREATE OR REPLACE FUNCTION increment_voice_usage(p_user_id UUID, p_minutes INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update or insert the usage record
  INSERT INTO student_usage_limits (user_id, voice_minutes_used_current_month)
  VALUES (p_user_id, p_minutes)
  ON CONFLICT (user_id)
  DO UPDATE SET
    voice_minutes_used_current_month = student_usage_limits.voice_minutes_used_current_month + p_minutes,
    updated_at = now();
END;
$$;