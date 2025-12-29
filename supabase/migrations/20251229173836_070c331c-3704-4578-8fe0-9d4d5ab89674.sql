-- One-time fix: Update last_activity for students with completed submissions where last_activity is outdated
UPDATE public.student_metrics sm
SET 
  last_activity = COALESCE(
    (SELECT MAX(COALESCE(s.completed_at, s.updated_at, s.created_at))
     FROM public.assignment_submissions s
     WHERE s.student_id = sm.student_id AND s.status = 'completed'),
    sm.last_activity
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.assignment_submissions s
  WHERE s.student_id = sm.student_id 
  AND s.status = 'completed'
  AND COALESCE(s.completed_at, s.updated_at, s.created_at) > sm.last_activity
);