-- Add recommendations column to transcript_analyses table to store structured recommendation data
ALTER TABLE public.transcript_analyses 
ADD COLUMN IF NOT EXISTS recommendations JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.transcript_analyses.recommendations IS 'Structured AI recommendations with practice types, routes, levels, and focus areas';