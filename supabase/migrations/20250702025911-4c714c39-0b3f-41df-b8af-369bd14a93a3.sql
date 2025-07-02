-- Fix access code processing by ensuring district exists

-- First, let's check what access codes exist and their target districts
-- and create missing districts in school_districts table

-- Create missing school districts for existing district access codes
INSERT INTO public.school_districts (id, name, code, created_at, updated_at)
SELECT DISTINCT 
  ac.target_id,
  ac.target_name,
  'DIST_' || substring(ac.code from 5),  -- Remove DIST prefix and add DIST_ for code
  now(),
  now()
FROM public.access_codes ac
WHERE ac.code_type = 'district'
  AND ac.target_id NOT IN (SELECT id FROM public.school_districts)
ON CONFLICT (id) DO NOTHING;

-- Verify we have the specific district needed for the current code
INSERT INTO public.school_districts (id, name, code, created_at, updated_at)
VALUES (
  'e0711c46-0cae-4d36-a6cd-c0597d1e6c1b'::uuid,
  'Evangel Christian District',
  'EVANGEL_DISTRICT',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;