-- Add cascade deletion: when an access code is deleted, delete the associated class and unenroll all students

-- Create function to handle access code deletion cascade
CREATE OR REPLACE FUNCTION public.cascade_delete_class_on_code_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process class type codes
  IF OLD.code_type = 'class' THEN
    -- Log the deletion
    RAISE NOTICE 'Deleting class % due to access code deletion', OLD.target_id;
    
    -- Delete all student enrollments for this class
    DELETE FROM public.student_enrollments
    WHERE class_id = OLD.target_id;
    
    -- Delete the class itself
    DELETE FROM public.classes
    WHERE id = OLD.target_id;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger for cascade deletion
DROP TRIGGER IF EXISTS trigger_cascade_delete_class ON public.access_codes;
CREATE TRIGGER trigger_cascade_delete_class
BEFORE DELETE ON public.access_codes
FOR EACH ROW
EXECUTE FUNCTION public.cascade_delete_class_on_code_deletion();