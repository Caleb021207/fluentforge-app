-- Drop the existing check constraint
ALTER TABLE public.usage_tracking 
DROP CONSTRAINT IF EXISTS usage_tracking_session_type_check;

-- Add updated check constraint with premium_voice_practice included
ALTER TABLE public.usage_tracking 
ADD CONSTRAINT usage_tracking_session_type_check 
CHECK (session_type = ANY (ARRAY['voice_practice'::text, 'text_chat'::text, 'certification'::text, 'premium_voice_practice'::text]));