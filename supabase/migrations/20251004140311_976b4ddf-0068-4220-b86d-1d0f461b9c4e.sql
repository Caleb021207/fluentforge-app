-- Update transcript_analyses table to reflect new three-section test structure
-- Rename columns to match new assessment categories

-- Add new columns
ALTER TABLE public.transcript_analyses 
ADD COLUMN IF NOT EXISTS reading_listening_score NUMERIC,
ADD COLUMN IF NOT EXISTS written_production_score NUMERIC,
ADD COLUMN IF NOT EXISTS spoken_fluency_score NUMERIC;

-- Migrate existing data (averaging related skills into new categories)
UPDATE public.transcript_analyses SET
  reading_listening_score = COALESCE((COALESCE(reading_score, 0) + COALESCE(listening_score, 0)) / 2.0, NULL),
  written_production_score = writing_score,
  spoken_fluency_score = speaking_score;

-- Drop old columns
ALTER TABLE public.transcript_analyses 
DROP COLUMN IF EXISTS reading_score,
DROP COLUMN IF EXISTS writing_score,
DROP COLUMN IF EXISTS speaking_score,
DROP COLUMN IF EXISTS listening_score;