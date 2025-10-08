-- Create function to update practice session counts in student_metrics
CREATE OR REPLACE FUNCTION public.update_student_practice_counts(target_student_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  voice_session_count INTEGER;
  text_session_count INTEGER;
BEGIN
  -- Count distinct voice practice sessions
  SELECT COALESCE(COUNT(DISTINCT session_id), 0)
  INTO voice_session_count
  FROM public.usage_tracking
  WHERE student_id = target_student_id
    AND session_type = 'voice_practice'
    AND session_id IS NOT NULL;

  -- Count distinct text practice sessions
  SELECT COALESCE(COUNT(DISTINCT session_id), 0)
  INTO text_session_count
  FROM public.usage_tracking
  WHERE student_id = target_student_id
    AND session_type = 'text_practice'
    AND session_id IS NOT NULL;

  -- Update student_metrics with session counts
  INSERT INTO public.student_metrics (
    student_id,
    premium_voice_calls,
    text_practice_calls,
    updated_at
  )
  VALUES (
    target_student_id,
    voice_session_count,
    text_session_count,
    NOW()
  )
  ON CONFLICT (student_id) 
  DO UPDATE SET
    premium_voice_calls = EXCLUDED.premium_voice_calls,
    text_practice_calls = EXCLUDED.text_practice_calls,
    updated_at = NOW();
END;
$$;

-- Update recalculate_student_metrics to include practice counts
CREATE OR REPLACE FUNCTION public.recalculate_student_metrics(target_student_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Call language metrics function
  PERFORM public.update_student_language_aggregate_metrics(target_student_id);
  
  -- Call usage aggregation function
  PERFORM public.update_student_usage_aggregates(target_student_id);
  
  -- Call practice counts function
  PERFORM public.update_student_practice_counts(target_student_id);
  
  -- Update last_activity
  UPDATE public.student_metrics
  SET last_activity = NOW()
  WHERE student_id = target_student_id;
END;
$$;