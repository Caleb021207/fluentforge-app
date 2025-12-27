-- Create personalized_flashcards table for auto-generated flashcards from student profiles
CREATE TABLE public.personalized_flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  example TEXT,
  category TEXT NOT NULL DEFAULT 'vocabulary', -- grammar, vocabulary, phrase
  source_type TEXT NOT NULL DEFAULT 'profile', -- profile, conversation
  source_session_id UUID, -- references conversation if from specific session
  cefr_level TEXT,
  mastery_level INTEGER NOT NULL DEFAULT 0, -- 0-5 for spaced repetition
  next_due TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_reviewed TIMESTAMP WITH TIME ZONE,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personalized_flashcards ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_personalized_flashcards_student_id ON public.personalized_flashcards(student_id);
CREATE INDEX idx_personalized_flashcards_next_due ON public.personalized_flashcards(next_due);
CREATE INDEX idx_personalized_flashcards_category ON public.personalized_flashcards(category);
CREATE INDEX idx_personalized_flashcards_mastery ON public.personalized_flashcards(mastery_level);

-- RLS Policies
-- Students can view their own flashcards
CREATE POLICY "Students can view their own flashcards"
  ON public.personalized_flashcards
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can update their own flashcards (for mastery updates)
CREATE POLICY "Students can update their own flashcards"
  ON public.personalized_flashcards
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Service role can insert flashcards (from edge function)
CREATE POLICY "Service can insert flashcards"
  ON public.personalized_flashcards
  FOR INSERT
  WITH CHECK (true);

-- Students can delete their own flashcards
CREATE POLICY "Students can delete their own flashcards"
  ON public.personalized_flashcards
  FOR DELETE
  USING (auth.uid() = student_id);

-- Teachers can view flashcards of students in their classes
CREATE POLICY "Teachers can view student flashcards"
  ON public.personalized_flashcards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se
      JOIN public.classes c ON c.id = se.class_id
      WHERE se.student_id = personalized_flashcards.student_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Function to update mastery using SM-2 algorithm
CREATE OR REPLACE FUNCTION public.update_flashcard_mastery(
  p_flashcard_id UUID,
  p_quality INTEGER -- 0-5 rating (0-2 = fail, 3-5 = pass)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_mastery INTEGER;
  new_mastery INTEGER;
  interval_days INTEGER;
BEGIN
  -- Get current mastery
  SELECT mastery_level INTO current_mastery
  FROM personalized_flashcards
  WHERE id = p_flashcard_id AND student_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Flashcard not found or access denied';
  END IF;
  
  -- SM-2 simplified algorithm
  IF p_quality < 3 THEN
    -- Failed: reset to 0
    new_mastery := 0;
    interval_days := 1;
  ELSE
    -- Passed: increase mastery
    new_mastery := LEAST(current_mastery + 1, 5);
    -- Interval increases with mastery: 1, 2, 4, 7, 14, 30 days
    interval_days := CASE new_mastery
      WHEN 0 THEN 1
      WHEN 1 THEN 2
      WHEN 2 THEN 4
      WHEN 3 THEN 7
      WHEN 4 THEN 14
      ELSE 30
    END;
  END IF;
  
  -- Update flashcard
  UPDATE personalized_flashcards
  SET 
    mastery_level = new_mastery,
    next_due = NOW() + (interval_days || ' days')::INTERVAL,
    last_reviewed = NOW(),
    review_count = review_count + 1,
    updated_at = NOW()
  WHERE id = p_flashcard_id AND student_id = auth.uid();
END;
$$;