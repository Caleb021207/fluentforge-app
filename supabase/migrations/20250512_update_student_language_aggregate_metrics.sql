
-- Create a function to update aggregate metrics
CREATE OR REPLACE FUNCTION public.update_student_language_aggregate_metrics(target_student_id uuid)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  avg_grammar NUMERIC;
  avg_complexity NUMERIC;
  metrics_count INTEGER;
BEGIN
  -- Calculate average metrics
  SELECT 
    COALESCE(AVG(grammar_accuracy), 0),
    COALESCE(AVG(conversation_complexity), 0),
    COUNT(*)
  INTO 
    avg_grammar,
    avg_complexity,
    metrics_count
  FROM public.student_language_metrics
  WHERE user_id = target_student_id;

  -- Update the student_metrics table with the aggregated values
  UPDATE public.student_metrics
  SET 
    avg_grammar_accuracy = avg_grammar,
    avg_conversation_complexity = avg_complexity,
    language_metrics_count = metrics_count
  WHERE student_id = target_student_id;
  
  -- If no record exists, create it (although this shouldn't happen in normal flow)
  IF NOT FOUND THEN
    INSERT INTO public.student_metrics (
      student_id,
      avg_grammar_accuracy,
      avg_conversation_complexity,
      language_metrics_count
    )
    SELECT
      target_student_id,
      avg_grammar,
      avg_complexity,
      metrics_count
    FROM public.classroom_memberships cm
    WHERE cm.student_id = target_student_id
    LIMIT 1;
  END IF;
END;
$$;
