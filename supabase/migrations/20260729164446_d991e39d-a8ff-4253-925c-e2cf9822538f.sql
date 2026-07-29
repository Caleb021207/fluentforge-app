
-- ============ CURRICULUM CONTENT MODEL ============

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL DEFAULT 'en',
  target_framework text NOT NULL DEFAULT 'CEFR' CHECK (target_framework IN ('CEFR','WIDA')),
  level_band text,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','gated','operational','retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  theme text,
  can_do_statement text,
  key_language_use text CHECK (key_language_use IN ('Narrate','Inform','Explain','Argue')),
  cefr_level text,
  wida_level integer,
  content_objective text,
  language_objective text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','gated','operational','retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('vocab','grammar','reading','listening','speaking','writing')),
  description text,
  target_grammar_point text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','gated','operational','retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  intro_md text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','gated','operational','retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'audio',
  url text,
  transcript text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.passages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL DEFAULT 'en',
  skill_type text CHECK (skill_type IN ('reading','listening')),
  cefr_level text,
  wida_level integer,
  topic text,
  key_language_use text CHECK (key_language_use IN ('Narrate','Inform','Explain','Argue')),
  title text,
  body text NOT NULL,
  word_count integer,
  readability_grade numeric,
  audio_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  source_model text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','gated','operational','retired')),
  gate_results jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('flashcard','cloze','matching','ordering','dictation','listening_mc','speaking','translation','dialogue')),
  prompt text NOT NULL,
  passage_id uuid REFERENCES public.passages(id) ON DELETE SET NULL,
  difficulty numeric,
  receptive_productive text CHECK (receptive_productive IN ('receptive','productive')),
  gate_results jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_model text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','gated','operational','retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.exercise_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  rationale text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL DEFAULT 'en',
  lemma text NOT NULL,
  translation_l1 text,
  part_of_speech text,
  frequency_rank integer,
  cefr_level text,
  example_sentence text,
  audio_asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  ipa text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vocab_lesson_map (
  vocabulary_id uuid NOT NULL REFERENCES public.vocabulary(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (vocabulary_id, lesson_id)
);

CREATE TABLE public.can_do_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework text NOT NULL CHECK (framework IN ('WIDA','NCSSFL-ACTFL','CEFR')),
  skill_or_mode text,
  level text,
  statement text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.content_can_do_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  can_do_id uuid NOT NULL REFERENCES public.can_do_statements(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_type, content_id, can_do_id)
);

CREATE INDEX idx_units_course ON public.units(course_id, position);
CREATE INDEX idx_skills_unit ON public.skills(unit_id, position);
CREATE INDEX idx_lessons_skill ON public.lessons(skill_id, position);
CREATE INDEX idx_exercises_lesson ON public.exercises(lesson_id, position);
CREATE INDEX idx_exercise_options_ex ON public.exercise_options(exercise_id, position);
CREATE INDEX idx_vocab_lemma ON public.vocabulary(language, lemma);

-- ============ GRANTS ============
GRANT SELECT ON public.courses, public.units, public.skills, public.lessons,
  public.exercises, public.vocabulary, public.vocab_lesson_map, public.passages,
  public.can_do_statements, public.content_can_do_map, public.assets TO authenticated;
GRANT SELECT ON public.exercise_options TO authenticated;

GRANT ALL ON public.courses, public.units, public.skills, public.lessons,
  public.exercises, public.exercise_options, public.vocabulary, public.vocab_lesson_map,
  public.passages, public.can_do_statements, public.content_can_do_map, public.assets TO service_role;

-- ============ RLS ============
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_lesson_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.can_do_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_can_do_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Learners/teachers: read published content only. Admins: read everything.
CREATE POLICY "courses_read" ON public.courses FOR SELECT TO authenticated
  USING (status = 'operational' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "courses_admin" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "units_read" ON public.units FOR SELECT TO authenticated
  USING (status = 'operational' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "units_admin" ON public.units FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "skills_read" ON public.skills FOR SELECT TO authenticated
  USING (status = 'operational' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "skills_admin" ON public.skills FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "lessons_read" ON public.lessons FOR SELECT TO authenticated
  USING (status = 'operational' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "lessons_admin" ON public.lessons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "exercises_read" ON public.exercises FOR SELECT TO authenticated
  USING (status = 'operational' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "exercises_admin" ON public.exercises FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Answer keys + rationales: admins only. Students never read this table.
CREATE POLICY "exercise_options_admin_only" ON public.exercise_options FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "passages_read" ON public.passages FOR SELECT TO authenticated
  USING (status = 'operational' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "passages_admin" ON public.passages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "vocabulary_read" ON public.vocabulary FOR SELECT TO authenticated USING (true);
CREATE POLICY "vocabulary_admin" ON public.vocabulary FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "vocab_lesson_map_read" ON public.vocab_lesson_map FOR SELECT TO authenticated USING (true);
CREATE POLICY "vocab_lesson_map_admin" ON public.vocab_lesson_map FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "can_do_read" ON public.can_do_statements FOR SELECT TO authenticated USING (true);
CREATE POLICY "can_do_admin" ON public.can_do_statements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "content_can_do_read" ON public.content_can_do_map FOR SELECT TO authenticated USING (true);
CREATE POLICY "content_can_do_admin" ON public.content_can_do_map FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "assets_read" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "assets_admin" ON public.assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- updated_at triggers
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_units_updated BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_skills_updated BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_exercises_updated BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_exercise_options_updated BEFORE UPDATE ON public.exercise_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_vocabulary_updated BEFORE UPDATE ON public.vocabulary FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_passages_updated BEFORE UPDATE ON public.passages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_can_do_updated BEFORE UPDATE ON public.can_do_statements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
