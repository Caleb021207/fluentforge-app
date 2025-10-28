-- Fix: Allow teachers to delete class codes for their classes
-- Currently teachers can only SELECT, not DELETE

-- Drop the existing limited policy
DROP POLICY IF EXISTS "Teachers can manage class codes for their classes" ON public.access_codes;

-- Create new policy that allows teachers to DELETE class codes they created
CREATE POLICY "Teachers can manage class codes for their classes"
ON public.access_codes
FOR ALL
TO authenticated
USING (
  code_type = 'class'::code_type 
  AND created_by = auth.uid()
)
WITH CHECK (
  code_type = 'class'::code_type 
  AND created_by = auth.uid()
);

-- Optional: When a class code is deleted, we could unenroll students
-- However, this might not be desired behavior - codes might just need to be deactivated
-- For now, we'll just ensure teachers can delete their own codes