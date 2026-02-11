
-- =============================================
-- ADD MISSING CORE ORG TABLES
-- =============================================

-- School districts
CREATE TABLE IF NOT EXISTS public.school_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_districts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Districts are viewable by everyone"
  ON public.school_districts FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- District settings
CREATE TABLE IF NOT EXISTS public.district_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES public.school_districts(id) ON DELETE CASCADE,
  min_age INTEGER NOT NULL DEFAULT 13,
  max_age INTEGER NOT NULL DEFAULT 99,
  require_parental_consent BOOLEAN NOT NULL DEFAULT false,
  consent_type TEXT NOT NULL DEFAULT 'individual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(district_id)
);
ALTER TABLE public.district_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "District settings are viewable by everyone"
  ON public.district_settings FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Schools
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district_id UUID REFERENCES public.school_districts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Schools viewable by authenticated"
  ON public.schools FOR SELECT
  USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Grade levels
CREATE TABLE IF NOT EXISTS public.grade_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_name TEXT NOT NULL,
  level_number INTEGER NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grade_levels ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Grade levels viewable by authenticated"
  ON public.grade_levels FOR SELECT
  USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Subjects viewable by authenticated"
  ON public.subjects FOR SELECT
  USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- PROFILES: add missing columns used by UI
-- =============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS target_level TEXT,
  ADD COLUMN IF NOT EXISTS target_date DATE,
  ADD COLUMN IF NOT EXISTS student_id TEXT,
  ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
  ADD COLUMN IF NOT EXISTS grade_level_id UUID REFERENCES public.grade_levels(id) ON DELETE SET NULL;

-- =============================================
-- DISTRICT USERS: add FK relationship for nested selects
-- =============================================
DO $$
BEGIN
  -- Drop existing FK if it points elsewhere, then add correct FK (idempotent-ish)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public'
      AND table_name='district_users'
      AND constraint_name='district_users_district_id_fkey'
  ) THEN
    ALTER TABLE public.district_users DROP CONSTRAINT district_users_district_id_fkey;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='district_users' AND column_name='district_id'
  ) THEN
    ALTER TABLE public.district_users
      ADD CONSTRAINT district_users_district_id_fkey
      FOREIGN KEY (district_id) REFERENCES public.school_districts(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- CLASSES: add fields + fix FK to profiles for PostgREST joins
-- =============================================
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS grade_level_id UUID REFERENCES public.grade_levels(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS period TEXT,
  ADD COLUMN IF NOT EXISTS room_number TEXT,
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2025-2026',
  ADD COLUMN IF NOT EXISTS semester TEXT,
  ADD COLUMN IF NOT EXISTS max_students INTEGER NOT NULL DEFAULT 30;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public'
      AND table_name='classes'
      AND constraint_name='classes_teacher_id_fkey'
  ) THEN
    ALTER TABLE public.classes DROP CONSTRAINT classes_teacher_id_fkey;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$
BEGIN
  ALTER TABLE public.classes
    ADD CONSTRAINT classes_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- STUDENT ENROLLMENTS: add fields + fix FK to profiles
-- =============================================
ALTER TABLE public.student_enrollments
  ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS final_grade TEXT,
  ADD COLUMN IF NOT EXISTS grade_points NUMERIC,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public'
      AND table_name='student_enrollments'
      AND constraint_name='student_enrollments_student_id_fkey'
  ) THEN
    ALTER TABLE public.student_enrollments DROP CONSTRAINT student_enrollments_student_id_fkey;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$
BEGIN
  ALTER TABLE public.student_enrollments
    ADD CONSTRAINT student_enrollments_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- TRANSCRIPT ANALYSES: add upload_date
-- =============================================
ALTER TABLE public.transcript_analyses
  ADD COLUMN IF NOT EXISTS upload_date TIMESTAMPTZ NOT NULL DEFAULT now();

-- =============================================
-- ASSIGNMENTS: add assignment_type used by UI
-- =============================================
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS assignment_type TEXT;

-- =============================================
-- STUDENT GRADES + USAGE METRICS
-- =============================================
CREATE TABLE IF NOT EXISTS public.student_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  points_earned NUMERIC,
  grade_letter TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Students manage own grades"
  ON public.student_grades FOR ALL
  USING (auth.uid() = student_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.student_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  practice_sessions INTEGER NOT NULL DEFAULT 0,
  voice_chat_minutes NUMERIC NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  week_starting DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_usage_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users view own usage metrics"
  ON public.student_usage_metrics FOR SELECT
  USING (auth.uid() = student_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- CERTIFICATION STATS TABLES
-- =============================================
CREATE TABLE IF NOT EXISTS public.class_certification_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  avg_score NUMERIC,
  student_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  academic_year TEXT
);
ALTER TABLE public.class_certification_stats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Teachers can view class certification stats"
  ON public.class_certification_stats FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.school_certification_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  avg_score NUMERIC,
  student_count INTEGER NOT NULL DEFAULT 0,
  class_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  academic_year TEXT
);
ALTER TABLE public.school_certification_stats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated can view school certification stats"
  ON public.school_certification_stats FOR SELECT
  USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- ACCESS CODES: align columns + RPCs with code
-- =============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='access_codes' AND column_name='is_active'
  ) THEN
    ALTER TABLE public.access_codes RENAME COLUMN is_active TO active;
  END IF;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

ALTER TABLE public.access_codes
  ADD COLUMN IF NOT EXISTS target_name TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Update the active-code select policy (drop + recreate)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can read active codes" ON public.access_codes;
  CREATE POLICY "Anyone can read active codes" ON public.access_codes FOR SELECT USING (active = true);
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Replace generate_access_code to match utils/accessCodeUtils.ts
CREATE OR REPLACE FUNCTION public.generate_access_code(
  p_code_type TEXT,
  p_target_id UUID,
  p_target_name TEXT,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_max_uses INTEGER DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := upper(substr(md5(random()::text), 1, 8));

  INSERT INTO public.access_codes (code, code_type, target_id, target_name, created_by, max_uses, expires_at, active)
  VALUES (new_code, p_code_type, p_target_id, p_target_name, auth.uid(), p_max_uses, p_expires_at, true);

  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Replace process_access_code to return shape expected by app
CREATE OR REPLACE FUNCTION public.process_access_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  code_row public.access_codes%ROWTYPE;
BEGIN
  SELECT * INTO code_row
  FROM public.access_codes
  WHERE code = upper(trim(p_code)) AND active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid code');
  END IF;

  IF code_row.max_uses IS NOT NULL AND code_row.current_uses >= code_row.max_uses THEN
    RETURN json_build_object('success', false, 'message', 'Code has reached maximum uses');
  END IF;

  IF code_row.expires_at IS NOT NULL AND code_row.expires_at < now() THEN
    RETURN json_build_object('success', false, 'message', 'Code has expired');
  END IF;

  UPDATE public.access_codes
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = code_row.id;

  IF code_row.code_type = 'class' AND code_row.target_id IS NOT NULL THEN
    INSERT INTO public.student_enrollments (class_id, student_id, status)
    VALUES (code_row.target_id, auth.uid(), 'active')
    ON CONFLICT (class_id, student_id) DO UPDATE SET status='active';

    RETURN json_build_object(
      'success', true,
      'message', 'Joined class successfully',
      'role', 'student',
      'assignment', code_row.target_id::text
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Code processed successfully',
    'role', code_row.code_type,
    'assignment', code_row.target_id::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Access code attempts
CREATE TABLE IF NOT EXISTS public.access_code_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempted_code TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.access_code_attempts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can insert own code attempts" ON public.access_code_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can view own code attempts" ON public.access_code_attempts
  FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- COMPLIANCE TABLES
-- =============================================
CREATE TABLE IF NOT EXISTS public.compliance_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  compliance_score INTEGER,
  notes TEXT,
  action_items JSONB,
  findings JSONB,
  last_audit_date DATE,
  next_audit_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_status ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Admins view compliance status" ON public.compliance_status
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.data_breach_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breach_date TIMESTAMPTZ NOT NULL,
  breach_type TEXT NOT NULL,
  breach_description TEXT NOT NULL,
  mitigation_steps TEXT NOT NULL,
  severity TEXT NOT NULL,
  affected_user_count INTEGER,
  affected_data_types TEXT[],
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.data_breach_notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Admins manage breach notifications" ON public.data_breach_notifications
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  file_format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  export_file_url TEXT,
  error_message TEXT
);
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage own export requests" ON public.data_export_requests
  FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins view all export requests" ON public.data_export_requests
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- EDUCATIONAL DATA ACCESS AUDIT: add columns used by UI
-- =============================================
ALTER TABLE public.educational_data_access_audit
  ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS data_category TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS data_accessed TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS educational_justification TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS legitimate_interest_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_granted BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS denial_reason TEXT,
  ADD COLUMN IF NOT EXISTS accessed_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- =============================================
-- RPC: last sign-in helper
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_last_sign_in(user_id UUID)
RETURNS TIMESTAMPTZ AS $$
  SELECT last_sign_in_at FROM auth.users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- =============================================
-- UPDATED_AT triggers for new tables
-- =============================================
DO $$ BEGIN
  CREATE TRIGGER update_school_districts_updated_at BEFORE UPDATE ON public.school_districts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_district_settings_updated_at BEFORE UPDATE ON public.district_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_access_codes_updated_at BEFORE UPDATE ON public.access_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_student_grades_updated_at BEFORE UPDATE ON public.student_grades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_student_usage_metrics_updated_at BEFORE UPDATE ON public.student_usage_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_compliance_status_updated_at BEFORE UPDATE ON public.compliance_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
