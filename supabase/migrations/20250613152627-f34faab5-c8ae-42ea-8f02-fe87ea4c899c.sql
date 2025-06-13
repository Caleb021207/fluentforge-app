-- Add DELETE policy for study_recommendations table
CREATE POLICY "Users can delete their own study recommendations" 
ON public.study_recommendations 
FOR DELETE 
USING (auth.uid() = user_id);