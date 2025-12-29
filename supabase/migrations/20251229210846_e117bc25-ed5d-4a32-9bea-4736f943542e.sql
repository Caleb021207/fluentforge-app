-- Add unique constraint on assignment_submissions to prevent duplicates
ALTER TABLE public.assignment_submissions 
ADD CONSTRAINT unique_assignment_student 
UNIQUE (assignment_id, student_id);

-- Create function to auto-create assignment submissions for enrolled students
CREATE OR REPLACE FUNCTION public.create_assignment_submissions_for_students()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.assignment_submissions (assignment_id, student_id, status)
  SELECT NEW.id, se.student_id, 'pending'
  FROM public.student_enrollments se
  WHERE se.class_id = NEW.class_id
    AND se.status = 'active'
  ON CONFLICT (assignment_id, student_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create submissions when assignment is created
CREATE TRIGGER trigger_create_assignment_submissions
AFTER INSERT ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.create_assignment_submissions_for_students();

-- Backfill: Create missing submissions for existing assignments
INSERT INTO public.assignment_submissions (assignment_id, student_id, status)
SELECT a.id, se.student_id, 'pending'
FROM public.assignments a
JOIN public.student_enrollments se ON se.class_id = a.class_id
WHERE se.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM public.assignment_submissions asub 
    WHERE asub.assignment_id = a.id AND asub.student_id = se.student_id
  )
ON CONFLICT (assignment_id, student_id) DO NOTHING;