-- Update the default voice minutes monthly limit from 400 to 100 minutes
ALTER TABLE public.student_usage_limits 
ALTER COLUMN voice_minutes_monthly_limit SET DEFAULT 100;

-- Update existing users who still have the old 400-minute limit to the new 100-minute limit
-- This ensures consistency across all users
UPDATE public.student_usage_limits 
SET voice_minutes_monthly_limit = 100,
    updated_at = NOW()
WHERE voice_minutes_monthly_limit = 400;