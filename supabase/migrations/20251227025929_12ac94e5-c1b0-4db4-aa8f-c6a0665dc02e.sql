-- Extend assignments table for conversation tasks
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS assignment_mode TEXT DEFAULT 'text_practice', -- 'text_practice', 'voice_practice', 'pronunciation'
ADD COLUMN IF NOT EXISTS topic_prompt TEXT,
ADD COLUMN IF NOT EXISTS cefr_level TEXT DEFAULT 'B1',
ADD COLUMN IF NOT EXISTS min_messages INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS grammar_requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS grading_rubric JSONB,
ADD COLUMN IF NOT EXISTS max_duration_minutes INTEGER DEFAULT 15;

-- Student assignment submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'graded')),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  -- Conversation data
  session_id TEXT,
  transcript JSONB,
  message_count INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  -- Grading
  ai_score NUMERIC,
  ai_feedback JSONB,
  teacher_override_score NUMERIC,
  teacher_notes TEXT,
  -- XP
  xp_awarded INTEGER DEFAULT 0,
  -- Auto-delete after 1 week
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Students can view their own submissions
CREATE POLICY "Students can view own submissions"
ON public.assignment_submissions
FOR SELECT
USING (auth.uid() = student_id);

-- Students can insert their own submissions
CREATE POLICY "Students can create own submissions"
ON public.assignment_submissions
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Students can update their own in-progress submissions
CREATE POLICY "Students can update own submissions"
ON public.assignment_submissions
FOR UPDATE
USING (auth.uid() = student_id AND status IN ('pending', 'in_progress'));

-- Teachers can view submissions for their class assignments
CREATE POLICY "Teachers can view class submissions"
ON public.assignment_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.classes c ON c.id = a.class_id
    WHERE a.id = assignment_submissions.assignment_id
    AND c.teacher_id = auth.uid()
  )
);

-- Teachers can update submissions (for grading override)
CREATE POLICY "Teachers can grade submissions"
ON public.assignment_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.classes c ON c.id = a.class_id
    WHERE a.id = assignment_submissions.assignment_id
    AND c.teacher_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON public.assignment_submissions(status);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_assignment_submission_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_assignment_submissions_timestamp ON public.assignment_submissions;
CREATE TRIGGER update_assignment_submissions_timestamp
BEFORE UPDATE ON public.assignment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_assignment_submission_timestamp();