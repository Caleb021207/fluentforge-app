-- Fix search_path on the trigger function
CREATE OR REPLACE FUNCTION public.update_assignment_submission_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;