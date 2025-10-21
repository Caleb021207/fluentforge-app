-- Courses structure
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cefr_min TEXT,
  cefr_max TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cefr_target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, idx)
);

CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  grammar_point TEXT,
  vocab_theme TEXT,
  cefr_target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(unit_id, idx)
);

CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  title TEXT NOT NULL,
  exercise_count INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(skill_id, idx)
);

CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flashcard', 'cloze', 'reorder', 'transform', 'guided_convo_text', 'guided_convo_voice')),
  payload JSONB NOT NULL,
  cefr_tag TEXT,
  topic TEXT,
  grammar_point TEXT,
  version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, idx)
);

CREATE INDEX idx_exercises_lesson ON public.exercises(lesson_id, idx);

-- Progress tracking
CREATE TABLE public.exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('correct', 'partial', 'incorrect')),
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  duration_ms INTEGER,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attempts_user_time ON public.exercise_attempts(user_id, created_at DESC);
CREATE INDEX idx_attempts_exercise ON public.exercise_attempts(exercise_id);

CREATE TABLE public.user_skill_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  mastery NUMERIC DEFAULT 0 CHECK (mastery >= 0 AND mastery <= 100),
  last_practiced_at TIMESTAMPTZ,
  PRIMARY KEY(user_id, skill_id)
);

CREATE INDEX idx_user_skill_progress ON public.user_skill_progress(user_id, skill_id);

-- SRS Wordbank
CREATE TABLE public.user_wordbank (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lemma TEXT NOT NULL,
  display TEXT NOT NULL,
  ipa TEXT,
  translation TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  cefr_tag TEXT,
  strength NUMERIC DEFAULT 0.3 CHECK (strength >= 0 AND strength <= 1),
  srs_bucket INTEGER DEFAULT 1,
  next_review_at TIMESTAMPTZ DEFAULT now(),
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, lemma)
);

CREATE INDEX idx_wordbank_review ON public.user_wordbank(user_id, next_review_at);
CREATE INDEX idx_wordbank_user ON public.user_wordbank(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wordbank ENABLE ROW LEVEL SECURITY;

-- Anyone can view courses, units, skills, lessons, exercises
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Anyone can view units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view exercises" ON public.exercises FOR SELECT USING (true);

-- Users can manage their own attempts
CREATE POLICY "Users can insert their own attempts" ON public.exercise_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own attempts" ON public.exercise_attempts FOR SELECT USING (auth.uid() = user_id);

-- Teachers can view student attempts in their classes
CREATE POLICY "Teachers can view student attempts" ON public.exercise_attempts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = exercise_attempts.user_id
    AND c.teacher_id = auth.uid()
  )
);

-- Users can manage their own progress
CREATE POLICY "Users can view their own progress" ON public.user_skill_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_skill_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_skill_progress FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own wordbank
CREATE POLICY "Users can view their own wordbank" ON public.user_wordbank FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wordbank" ON public.user_wordbank FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wordbank" ON public.user_wordbank FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wordbank" ON public.user_wordbank FOR DELETE USING (auth.uid() = user_id);