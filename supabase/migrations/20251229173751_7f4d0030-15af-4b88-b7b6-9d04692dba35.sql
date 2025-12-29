-- Create trigger function to update student_metrics.last_activity when assignment is completed
CREATE OR REPLACE FUNCTION public.update_student_activity_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity when submission status changes to 'completed' or when completed_at is set
  IF (NEW.status = 'completed' OR NEW.completed_at IS NOT NULL) THEN
    INSERT INTO public.student_metrics (student_id, last_activity)
    VALUES (NEW.student_id, NOW())
    ON CONFLICT (student_id) 
    DO UPDATE SET 
      last_activity = NOW(),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on assignment_submissions
DROP TRIGGER IF EXISTS update_activity_on_submission ON public.assignment_submissions;
CREATE TRIGGER update_activity_on_submission
  AFTER INSERT OR UPDATE ON public.assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_activity_on_submission();