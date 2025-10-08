-- Update the update_student_practice_counts function to use created_at as fallback for last_activity
CREATE OR REPLACE FUNCTION public.update_student_practice_counts(target_student_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO student_metrics (
    student_id,
    text_practice_calls,
    premium_voice_calls,
    language_metrics_count,
    avg_grammar_accuracy,
    avg_conversation_complexity,
    last_activity,
    updated_at
  )
  SELECT 
    target_student_id,
    COALESCE(SUM(CASE WHEN session_type = 'text_practice' THEN 1 ELSE 0 END), 0) as text_practice_calls,
    COALESCE(SUM(CASE WHEN session_type = 'voice_practice' THEN 1 ELSE 0 END), 0) as premium_voice_calls,
    COALESCE(COUNT(DISTINCT slm.id), 0) as language_metrics_count,
    COALESCE(AVG(slm.grammar_accuracy), 0) as avg_grammar_accuracy,
    COALESCE(AVG(slm.conversation_complexity), 0) as avg_conversation_complexity,
    MAX(COALESCE(ut.ended_at, ut.created_at)) as last_activity,
    NOW() as updated_at
  FROM usage_tracking ut
  LEFT JOIN student_language_metrics slm ON slm.user_id = target_student_id
  WHERE ut.student_id = target_student_id
  GROUP BY target_student_id
  ON CONFLICT (student_id) 
  DO UPDATE SET
    text_practice_calls = EXCLUDED.text_practice_calls,
    premium_voice_calls = EXCLUDED.premium_voice_calls,
    language_metrics_count = EXCLUDED.language_metrics_count,
    avg_grammar_accuracy = EXCLUDED.avg_grammar_accuracy,
    avg_conversation_complexity = EXCLUDED.avg_conversation_complexity,
    last_activity = EXCLUDED.last_activity,
    updated_at = NOW();
END;
$function$;