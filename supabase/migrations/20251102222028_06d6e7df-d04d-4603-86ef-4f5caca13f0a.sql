-- Add new properly named columns for clarity
ALTER TABLE student_usage_limits 
ADD COLUMN IF NOT EXISTS whisper_stt_minutes_monthly_limit INTEGER DEFAULT 180,
ADD COLUMN IF NOT EXISTS whisper_stt_minutes_used_current_month INTEGER DEFAULT 0;

-- Migrate data from old stt_minutes columns to new whisper_stt columns
UPDATE student_usage_limits
SET 
  whisper_stt_minutes_monthly_limit = COALESCE(stt_minutes_monthly_limit, voice_minutes_monthly_limit, 180),
  whisper_stt_minutes_used_current_month = COALESCE(stt_minutes_used_current_month, voice_minutes_used_current_month, 0);

-- Update the RPC functions to use correct columns
CREATE OR REPLACE FUNCTION public.can_use_whisper_stt(p_student_id UUID)
RETURNS TABLE(can_use BOOLEAN, minutes_remaining INTEGER, minutes_limit INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (whisper_stt_minutes_used_current_month < whisper_stt_minutes_monthly_limit) as can_use,
    (whisper_stt_minutes_monthly_limit - whisper_stt_minutes_used_current_month) as minutes_remaining,
    whisper_stt_minutes_monthly_limit as minutes_limit
  FROM student_usage_limits
  WHERE student_id = p_student_id;
END;
$$;

-- Update increment_stt_usage to use new column
CREATE OR REPLACE FUNCTION public.increment_stt_usage(p_student_id UUID, p_minutes INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE student_usage_limits
  SET whisper_stt_minutes_used_current_month = whisper_stt_minutes_used_current_month + p_minutes
  WHERE student_id = p_student_id;
END;
$$;