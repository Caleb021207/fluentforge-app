
-- Create student_language_metrics table for storing individual language assessment records
CREATE TABLE public.student_language_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT,
  grammar_accuracy NUMERIC DEFAULT 0,
  conversation_complexity NUMERIC DEFAULT 0,
  pronunciation_accuracy NUMERIC DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to student_metrics table
ALTER TABLE public.student_metrics 
ADD COLUMN IF NOT EXISTS avg_grammar_accuracy NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_conversation_complexity NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS language_metrics_count INTEGER DEFAULT 0;

-- Create class_student_metrics view for classroom analytics
CREATE VIEW public.class_student_metrics AS
SELECT 
  sm.student_id,
  cm.classroom_id,
  p.display_name as student_name,
  au.email as student_email,
  sm.text_practice_calls,
  sm.premium_voice_calls,
  sm.last_activity
FROM public.student_metrics sm
JOIN public.classroom_memberships cm ON sm.student_id = cm.student_id
LEFT JOIN public.profiles p ON sm.student_id = p.id
LEFT JOIN auth.users au ON sm.student_id = au.id;

-- Create the missing function
CREATE OR REPLACE FUNCTION public.update_student_language_aggregate_metrics(target_student_id uuid)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  avg_grammar NUMERIC;
  avg_complexity NUMERIC;
  metrics_count INTEGER;
BEGIN
  -- Calculate average metrics from student_language_metrics
  SELECT 
    COALESCE(AVG(grammar_accuracy), 0),
    COALESCE(AVG(conversation_complexity), 0),
    COUNT(*)
  INTO 
    avg_grammar,
    avg_complexity,
    metrics_count
  FROM public.student_language_metrics
  WHERE user_id = target_student_id;

  -- Update the student_metrics table with the aggregated values
  UPDATE public.student_metrics
  SET 
    avg_grammar_accuracy = avg_grammar,
    avg_conversation_complexity = avg_complexity,
    language_metrics_count = metrics_count
  WHERE student_id = target_student_id;
  
  -- If no record exists, create it
  IF NOT FOUND THEN
    INSERT INTO public.student_metrics (
      student_id,
      avg_grammar_accuracy,
      avg_conversation_complexity,
      language_metrics_count
    )
    VALUES (
      target_student_id,
      avg_grammar,
      avg_complexity,
      metrics_count
    );
  END IF;
END;
$$;

-- Enable RLS on student_language_metrics
ALTER TABLE public.student_language_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_language_metrics
CREATE POLICY "Users can view their own language metrics" 
  ON public.student_language_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own language metrics" 
  ON public.student_language_metrics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own language metrics" 
  ON public.student_language_metrics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own language metrics" 
  ON public.student_language_metrics 
  FOR DELETE 
  USING (auth.uid() = user_id);
