-- Add TTS/STT tracking columns to student_usage_limits
ALTER TABLE student_usage_limits
ADD COLUMN IF NOT EXISTS tts_minutes_monthly_limit INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS tts_minutes_used_current_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stt_minutes_monthly_limit INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS stt_minutes_used_current_month INTEGER DEFAULT 0;

-- Update existing records to have the new limits
UPDATE student_usage_limits
SET tts_minutes_monthly_limit = 60,
    tts_minutes_used_current_month = 0,
    stt_minutes_monthly_limit = 120,
    stt_minutes_used_current_month = 0
WHERE tts_minutes_monthly_limit IS NULL;

-- Update voice_minutes_monthly_limit from 100 to 60
UPDATE student_usage_limits
SET voice_minutes_monthly_limit = 60
WHERE voice_minutes_monthly_limit = 100;

ALTER TABLE student_usage_limits
ALTER COLUMN voice_minutes_monthly_limit SET DEFAULT 60;

-- Update the monthly reset function to include TTS/STT fields
CREATE OR REPLACE FUNCTION reset_monthly_usage_limits()
RETURNS void AS $$
BEGIN
  UPDATE student_usage_limits
  SET voice_minutes_used_current_month = 0,
      premium_voice_minutes_used_current_month = 0,
      text_messages_used_current_month = 0,
      tts_minutes_used_current_month = 0,
      stt_minutes_used_current_month = 0,
      last_reset_month = CURRENT_TIMESTAMP,
      current_month = DATE_TRUNC('month', CURRENT_TIMESTAMP)
  WHERE current_month < DATE_TRUNC('month', CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;