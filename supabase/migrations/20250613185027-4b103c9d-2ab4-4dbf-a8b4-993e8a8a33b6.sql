-- Create table to track recent pronunciation phrases
CREATE TABLE public.recent_phrases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phrase TEXT NOT NULL,
  level TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recent_phrases ENABLE ROW LEVEL SECURITY;

-- Create policies for phrase access (read-only for all authenticated users)
CREATE POLICY "Anyone can view recent phrases" 
ON public.recent_phrases 
FOR SELECT 
USING (true);

-- Create policy for inserting new phrases (system use only via edge functions)
CREATE POLICY "Service role can insert phrases" 
ON public.recent_phrases 
FOR INSERT 
WITH CHECK (true);

-- Create policy for deleting old phrases (system use only via edge functions)
CREATE POLICY "Service role can delete phrases" 
ON public.recent_phrases 
FOR DELETE 
USING (true);

-- Create index for efficient querying by level and language
CREATE INDEX idx_recent_phrases_level_language ON public.recent_phrases(level, language);

-- Create index for efficient cleanup by creation date
CREATE INDEX idx_recent_phrases_created_at ON public.recent_phrases(created_at);

-- Function to clean up old phrases (keep only last 15 per level/language)
CREATE OR REPLACE FUNCTION public.cleanup_old_phrases(p_level text, p_language text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete phrases beyond the 15 most recent for this level/language combination
  DELETE FROM public.recent_phrases
  WHERE id IN (
    SELECT id
    FROM public.recent_phrases
    WHERE level = p_level AND language = p_language
    ORDER BY created_at DESC
    OFFSET 15
  );
END;
$$;