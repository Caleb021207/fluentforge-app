-- Drop the existing public SELECT policy on recent_phrases
DROP POLICY IF EXISTS "Anyone can view recent phrases" ON public.recent_phrases;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view recent phrases"
ON public.recent_phrases
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);