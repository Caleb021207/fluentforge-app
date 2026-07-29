
-- ============ lesson_progress ============
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress',
  attempts integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  accuracy numeric NOT NULL DEFAULT 0,
  last_exercise_id uuid,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own lesson progress" ON public.lesson_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers read their students lesson progress" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

-- ============ skill_mastery ============
CREATE TABLE public.skill_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  mastery numeric NOT NULL DEFAULT 0,
  ability numeric NOT NULL DEFAULT 0.3,
  attempts integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  recent_window jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_practiced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill_id)
);
GRANT SELECT ON public.skill_mastery TO authenticated;
GRANT ALL ON public.skill_mastery TO service_role;
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own skill mastery" ON public.skill_mastery
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers read their students skill mastery" ON public.skill_mastery
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

-- ============ exercise_attempts ============
CREATE TABLE public.exercise_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES public.skills(id) ON DELETE CASCADE,
  is_correct boolean NOT NULL,
  selected_option_id uuid,
  difficulty numeric,
  response_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exercise_attempts TO authenticated;
GRANT ALL ON public.exercise_attempts TO service_role;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own exercise attempts" ON public.exercise_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers read their students exercise attempts" ON public.exercise_attempts
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

-- ============ vocab_card_state (FSRS) ============
CREATE TABLE public.vocab_card_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id uuid NOT NULL REFERENCES public.vocabulary(id) ON DELETE CASCADE,
  stability numeric NOT NULL DEFAULT 0,
  difficulty numeric NOT NULL DEFAULT 0,
  due timestamptz NOT NULL DEFAULT now(),
  state integer NOT NULL DEFAULT 0,
  reps integer NOT NULL DEFAULT 0,
  lapses integer NOT NULL DEFAULT 0,
  elapsed_days numeric NOT NULL DEFAULT 0,
  scheduled_days numeric NOT NULL DEFAULT 0,
  learning_steps integer NOT NULL DEFAULT 0,
  last_review timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, vocabulary_id)
);
GRANT SELECT ON public.vocab_card_state TO authenticated;
GRANT ALL ON public.vocab_card_state TO service_role;
ALTER TABLE public.vocab_card_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own card state" ON public.vocab_card_state
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers read their students card state" ON public.vocab_card_state
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

-- ============ vocab_review_log ============
CREATE TABLE public.vocab_review_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id uuid NOT NULL REFERENCES public.vocabulary(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  state integer NOT NULL,
  due timestamptz,
  stability numeric,
  difficulty numeric,
  elapsed_days numeric,
  last_elapsed_days numeric,
  scheduled_days numeric,
  review timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vocab_review_log TO authenticated;
GRANT ALL ON public.vocab_review_log TO service_role;
ALTER TABLE public.vocab_review_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own review log" ON public.vocab_review_log
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers read their students review log" ON public.vocab_review_log
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

-- ============ xp_events ============
CREATE TABLE public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL,
  amount integer NOT NULL,
  ref_type text,
  ref_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.xp_events TO authenticated;
GRANT ALL ON public.xp_events TO service_role;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own xp events" ON public.xp_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers read their students xp events" ON public.xp_events
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

-- ============ learner_streaks ============
CREATE TABLE public.learner_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  freezes_available integer NOT NULL DEFAULT 2,
  freezes_used integer NOT NULL DEFAULT 0,
  last_freeze_used_on date,
  freeze_refilled_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learner_streaks TO authenticated;
GRANT ALL ON public.learner_streaks TO service_role;
ALTER TABLE public.learner_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own streak" ON public.learner_streaks
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Teachers read their students streak" ON public.learner_streaks
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

-- ============ indexes ============
CREATE INDEX idx_lesson_progress_user ON public.lesson_progress (user_id);
CREATE INDEX idx_skill_mastery_user ON public.skill_mastery (user_id);
CREATE INDEX idx_exercise_attempts_user_created ON public.exercise_attempts (user_id, created_at DESC);
CREATE INDEX idx_card_state_due ON public.vocab_card_state (user_id, due);
CREATE INDEX idx_review_log_user ON public.vocab_review_log (user_id, review DESC);
CREATE INDEX idx_xp_events_user_created ON public.xp_events (user_id, created_at DESC);

-- ============ updated_at triggers ============
CREATE TRIGGER trg_lesson_progress_updated BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_skill_mastery_updated BEFORE UPDATE ON public.skill_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_vocab_card_state_updated BEFORE UPDATE ON public.vocab_card_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_learner_streaks_updated BEFORE UPDATE ON public.learner_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
