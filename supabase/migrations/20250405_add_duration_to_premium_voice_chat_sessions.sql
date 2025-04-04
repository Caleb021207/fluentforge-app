
-- Add a duration_seconds column to track the actual time used in each session
ALTER TABLE premium_voice_chat_sessions 
ADD COLUMN duration_seconds INTEGER;

-- Create an index for more efficient date querying
CREATE INDEX idx_premium_voice_chat_sessions_date 
ON premium_voice_chat_sessions (session_start);
