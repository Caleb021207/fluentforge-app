-- Add new columns to user_progression table for tracking various activities
ALTER TABLE user_progression 
  ADD COLUMN IF NOT EXISTS text_messages_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS voice_messages_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pronunciation_exercises INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversations_analyzed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exams_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS premium_voice_messages INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS realtime_ai_messages INTEGER DEFAULT 0;

-- Add index for performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_progression_user_id ON user_progression(user_id);