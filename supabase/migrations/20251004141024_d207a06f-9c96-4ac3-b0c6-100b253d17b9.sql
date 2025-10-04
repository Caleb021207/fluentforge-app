-- Clear all old test report data that doesn't match new three-section structure

-- First, delete related records that reference transcript analyses
DELETE FROM public.study_recommendations 
WHERE transcript_id IN (SELECT id FROM public.transcript_analyses);

DELETE FROM public.progress_milestones 
WHERE transcript_id IN (SELECT id FROM public.transcript_analyses);

-- Now delete all transcript analyses
DELETE FROM public.transcript_analyses;