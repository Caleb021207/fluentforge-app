
-- =========================================================
-- 1. SECURITY DEFINER HELPERS (locked search_path)
-- =========================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of_class(_teacher uuid, _class uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.classes c WHERE c.id = _class AND c.teacher_id = _teacher);
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of_student(_teacher uuid, _student uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = _student AND c.teacher_id = _teacher
  );
$$;

-- =========================================================
-- 2. COPPA / age-gate columns
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_year integer,
  ADD COLUMN IF NOT EXISTS is_minor boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parental_consent_granted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parental_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS age_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS safety_mode text NOT NULL DEFAULT 'standard';

-- =========================================================
-- 3. PRIVILEGE-ESCALATION GUARD ON profiles
-- =========================================================
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  is_privileged boolean := (auth.uid() IS NULL) OR public.has_role(auth.uid(), 'admin');
BEGIN
  IF is_privileged THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := COALESCE(NULLIF(NEW.role, ''), 'student');
    IF NEW.role <> 'student' THEN NEW.role := 'student'; END IF;
    NEW.account_tier := COALESCE(NEW.account_tier, 'standard');
    NEW.is_minor := false;
    NEW.parental_consent_granted := false;
    NEW.safety_mode := 'standard';
    RETURN NEW;
  END IF;

  NEW.role := OLD.role;
  NEW.account_tier := OLD.account_tier;
  NEW.school_id := OLD.school_id;
  NEW.grade_level_id := OLD.grade_level_id;
  NEW.is_minor := OLD.is_minor;
  NEW.parental_consent_granted := OLD.parental_consent_granted;
  NEW.parental_consent_at := OLD.parental_consent_at;
  NEW.age_verified_at := OLD.age_verified_at;
  NEW.safety_mode := OLD.safety_mode;
  NEW.birth_year := OLD.birth_year;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER protect_profile_privileged_columns
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- =========================================================
-- 4. ASSIGNMENT SUBMISSION SCORE GUARD
-- =========================================================
CREATE OR REPLACE FUNCTION public.protect_submission_scores()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  is_teacher boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.id = NEW.assignment_id AND a.teacher_id = auth.uid()
  ) INTO is_teacher;

  IF is_teacher OR public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.score := NULL;
    NEW.teacher_override_score := NULL;
    NEW.teacher_notes := NULL;
  ELSE
    NEW.score := OLD.score;
    NEW.teacher_override_score := OLD.teacher_override_score;
    NEW.teacher_notes := OLD.teacher_notes;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_submission_scores ON public.assignment_submissions;
CREATE TRIGGER protect_submission_scores
BEFORE INSERT OR UPDATE ON public.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION public.protect_submission_scores();

-- =========================================================
-- 5. RATE LIMIT COUNTERS (service_role only)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bucket text NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, bucket, day)
);
GRANT ALL ON public.usage_counters TO service_role;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own counters" ON public.usage_counters;
CREATE POLICY "Users can view own counters" ON public.usage_counters
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_usage_counters_updated_at ON public.usage_counters;
CREATE TRIGGER update_usage_counters_updated_at
BEFORE UPDATE ON public.usage_counters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.consume_rate_limit(p_user_id uuid, p_bucket text, p_daily_limit integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.usage_counters (user_id, bucket, day, count)
  VALUES (p_user_id, p_bucket, (now() AT TIME ZONE 'utc')::date, 1)
  ON CONFLICT (user_id, bucket, day)
  DO UPDATE SET count = public.usage_counters.count + 1, updated_at = now()
  RETURNING count INTO new_count;
  RETURN new_count <= p_daily_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(uuid, text, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(uuid, text, integer) TO service_role;

-- =========================================================
-- 6. REMOVE PRIVILEGE-ESCALATION-CAPABLE / LEGACY FUNCTIONS
-- =========================================================
DROP FUNCTION IF EXISTS public.make_myself_teacher();
DROP FUNCTION IF EXISTS public.make_myself_admin();
DROP FUNCTION IF EXISTS public.set_my_role(text);
REVOKE ALL ON FUNCTION public.generate_access_code(text, uuid, integer, integer) FROM public, anon;
REVOKE ALL ON FUNCTION public.generate_access_code(text, uuid, text, timestamptz, integer) FROM public, anon;

-- =========================================================
-- 7. RLS REBUILD
-- =========================================================

-- access_codes: no more public reads
DROP POLICY IF EXISTS "Anyone can read active codes" ON public.access_codes;
DROP POLICY IF EXISTS "Creators can manage own codes" ON public.access_codes;
CREATE POLICY "Creators and admins manage codes" ON public.access_codes
FOR ALL TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- access_code_attempts
DROP POLICY IF EXISTS "Users can insert own code attempts" ON public.access_code_attempts;
DROP POLICY IF EXISTS "Users can view own code attempts" ON public.access_code_attempts;
CREATE POLICY "Users insert own code attempts" ON public.access_code_attempts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own code attempts" ON public.access_code_attempts
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- api_calls_tracking: server writes only
DROP POLICY IF EXISTS "Users can insert own api tracking" ON public.api_calls_tracking;
DROP POLICY IF EXISTS "Users can view own api tracking" ON public.api_calls_tracking;
CREATE POLICY "Users view own api tracking" ON public.api_calls_tracking
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- assignments
DROP POLICY IF EXISTS "Students can view class assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can manage own assignments" ON public.assignments;
CREATE POLICY "Students view enrolled class assignments" ON public.assignments
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.student_enrollments se
          WHERE se.class_id = assignments.class_id AND se.student_id = auth.uid())
);
CREATE POLICY "Teachers manage own assignments" ON public.assignments
FOR ALL TO authenticated
USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- assignment_submissions
DROP POLICY IF EXISTS "Students can manage own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Teachers can update class submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Teachers can view class submissions" ON public.assignment_submissions;
CREATE POLICY "Students view own submissions" ON public.assignment_submissions
FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students create own submissions" ON public.assignment_submissions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students update own submissions" ON public.assignment_submissions
FOR UPDATE TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers view class submissions" ON public.assignment_submissions
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assignments a
          WHERE a.id = assignment_submissions.assignment_id AND a.teacher_id = auth.uid())
);
CREATE POLICY "Teachers update class submissions" ON public.assignment_submissions
FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assignments a
          WHERE a.id = assignment_submissions.assignment_id AND a.teacher_id = auth.uid())
);

-- certification_attempts: read-own only, server writes
DROP POLICY IF EXISTS "Users can insert own attempts" ON public.certification_attempts;
DROP POLICY IF EXISTS "Users can update own attempts" ON public.certification_attempts;
DROP POLICY IF EXISTS "Users can view own attempts" ON public.certification_attempts;
CREATE POLICY "Users view own attempts" ON public.certification_attempts
FOR SELECT TO authenticated USING (
  auth.uid() = user_id
  OR public.is_teacher_of_student(auth.uid(), user_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- certification_transcripts
DROP POLICY IF EXISTS "Users can insert own transcripts" ON public.certification_transcripts;
DROP POLICY IF EXISTS "Users can view own transcripts" ON public.certification_transcripts;
CREATE POLICY "Users view own transcripts" ON public.certification_transcripts
FOR SELECT TO authenticated USING (
  auth.uid() = user_id
  OR public.is_teacher_of_student(auth.uid(), user_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- class_certification_stats
DROP POLICY IF EXISTS "Teachers can view class certification stats" ON public.class_certification_stats;
CREATE POLICY "Teachers view own class certification stats" ON public.class_certification_stats
FOR SELECT TO authenticated
USING (public.is_teacher_of_class(auth.uid(), class_id) OR public.has_role(auth.uid(), 'admin'));

-- classes (fixes broken enrollment join that exposed every class)
DROP POLICY IF EXISTS "Students can view enrolled classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage own classes" ON public.classes;
CREATE POLICY "Students view enrolled classes" ON public.classes
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.student_enrollments se
          WHERE se.class_id = classes.id AND se.student_id = auth.uid())
);
CREATE POLICY "Teachers manage own classes" ON public.classes
FOR ALL TO authenticated
USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- district_settings / school_districts / schools / subjects / grade_levels: signed-in reads only
DROP POLICY IF EXISTS "District settings are viewable by everyone" ON public.district_settings;
CREATE POLICY "Authenticated view district settings" ON public.district_settings
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Districts are viewable by everyone" ON public.school_districts;
CREATE POLICY "Authenticated view districts" ON public.school_districts
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Schools viewable by authenticated" ON public.schools;
CREATE POLICY "Authenticated view schools" ON public.schools
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Subjects viewable by authenticated" ON public.subjects;
CREATE POLICY "Authenticated view subjects" ON public.subjects
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Grade levels viewable by authenticated" ON public.grade_levels;
CREATE POLICY "Authenticated view grade levels" ON public.grade_levels
FOR SELECT TO authenticated USING (true);

-- district_users
DROP POLICY IF EXISTS "Users can view own district data" ON public.district_users;
CREATE POLICY "Users view own district data" ON public.district_users
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- educational_data_access_audit
DROP POLICY IF EXISTS "Users can view own access logs" ON public.educational_data_access_audit;
CREATE POLICY "Users view own access logs" ON public.educational_data_access_audit
FOR SELECT TO authenticated
USING (auth.uid() = accessed_user_id OR public.has_role(auth.uid(), 'admin'));

-- personalized_flashcards
DROP POLICY IF EXISTS "Users can manage own flashcards" ON public.personalized_flashcards;
CREATE POLICY "Users manage own flashcards" ON public.personalized_flashcards
FOR ALL TO authenticated
USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- profiles: no more world-readable directory
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
FOR SELECT TO authenticated USING (
  auth.uid() = id
  OR public.is_teacher_of_student(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users insert own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- profile_public_data
DROP POLICY IF EXISTS "Public data viewable by all" ON public.profile_public_data;
DROP POLICY IF EXISTS "Users insert own public data" ON public.profile_public_data;
DROP POLICY IF EXISTS "Users update own public data" ON public.profile_public_data;
CREATE POLICY "Authenticated view public profile data" ON public.profile_public_data
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own public profile data" ON public.profile_public_data
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own public profile data" ON public.profile_public_data
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recent_phrases
DROP POLICY IF EXISTS "Anyone can read phrases" ON public.recent_phrases;
DROP POLICY IF EXISTS "Authenticated can insert phrases" ON public.recent_phrases;
CREATE POLICY "Authenticated read phrases" ON public.recent_phrases
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert phrases" ON public.recent_phrases
FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- school_certification_stats
DROP POLICY IF EXISTS "Authenticated can view school certification stats" ON public.school_certification_stats;
CREATE POLICY "School members view school certification stats" ON public.school_certification_stats
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.profiles p
             WHERE p.id = auth.uid() AND p.school_id = school_certification_stats.school_id)
);

-- student_enrollments
DROP POLICY IF EXISTS "Students can insert own enrollment" ON public.student_enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Teachers can delete enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Teachers can view class enrollments" ON public.student_enrollments;
CREATE POLICY "Students insert own enrollment" ON public.student_enrollments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students view own enrollments" ON public.student_enrollments
FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Teachers view class enrollments" ON public.student_enrollments
FOR SELECT TO authenticated USING (public.is_teacher_of_class(auth.uid(), class_id));
CREATE POLICY "Teachers delete class enrollments" ON public.student_enrollments
FOR DELETE TO authenticated USING (public.is_teacher_of_class(auth.uid(), class_id));

-- student_grades: read-only for students, teachers scoped, writes server-side
DROP POLICY IF EXISTS "Students manage own grades" ON public.student_grades;
CREATE POLICY "Students view own grades" ON public.student_grades
FOR SELECT TO authenticated USING (
  auth.uid() = student_id
  OR public.is_teacher_of_student(auth.uid(), student_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- student_language_metrics
DROP POLICY IF EXISTS "Users can insert own language metrics" ON public.student_language_metrics;
DROP POLICY IF EXISTS "Users can view own language metrics" ON public.student_language_metrics;
CREATE POLICY "Users view own language metrics" ON public.student_language_metrics
FOR SELECT TO authenticated USING (
  auth.uid() = user_id
  OR public.is_teacher_of_student(auth.uid(), user_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- student_metrics
DROP POLICY IF EXISTS "Teachers can view student metrics" ON public.student_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON public.student_metrics;
DROP POLICY IF EXISTS "Users can update own metrics" ON public.student_metrics;
DROP POLICY IF EXISTS "Users can view own metrics" ON public.student_metrics;
CREATE POLICY "Users view own metrics" ON public.student_metrics
FOR SELECT TO authenticated USING (
  auth.uid() = student_id
  OR public.is_teacher_of_student(auth.uid(), student_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- student_usage_limits: students must not raise their own quota
DROP POLICY IF EXISTS "Users can insert own limits" ON public.student_usage_limits;
DROP POLICY IF EXISTS "Users can update own limits" ON public.student_usage_limits;
DROP POLICY IF EXISTS "Users can view own limits" ON public.student_usage_limits;
CREATE POLICY "Users view own limits" ON public.student_usage_limits
FOR SELECT TO authenticated USING (
  auth.uid() = student_id
  OR public.is_teacher_of_student(auth.uid(), student_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- student_usage_metrics
DROP POLICY IF EXISTS "Users view own usage metrics" ON public.student_usage_metrics;
CREATE POLICY "Users view own usage metrics" ON public.student_usage_metrics
FOR SELECT TO authenticated USING (
  auth.uid() = student_id
  OR public.is_teacher_of_student(auth.uid(), student_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- study_recommendations
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.study_recommendations;
CREATE POLICY "Users view own recommendations" ON public.study_recommendations
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- transcript_analyses
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Users can view own analyses" ON public.transcript_analyses;
CREATE POLICY "Users view own analyses" ON public.transcript_analyses
FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

-- usage_tracking
DROP POLICY IF EXISTS "Users can insert own tracking" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can update own tracking" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can view own tracking" ON public.usage_tracking;
CREATE POLICY "Users view own tracking" ON public.usage_tracking
FOR SELECT TO authenticated USING (
  auth.uid() = student_id
  OR public.is_teacher_of_student(auth.uid(), student_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- user_progression: XP awarded server-side only
DROP POLICY IF EXISTS "Users can insert own progression" ON public.user_progression;
DROP POLICY IF EXISTS "Users can update own progression" ON public.user_progression;
DROP POLICY IF EXISTS "Users can view all progression" ON public.user_progression;
CREATE POLICY "Users view own progression" ON public.user_progression
FOR SELECT TO authenticated USING (
  auth.uid() = user_id
  OR public.is_teacher_of_student(auth.uid(), user_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- admin-only tables re-scoped to authenticated role
DROP POLICY IF EXISTS "Admins can manage override logs" ON public.admin_override_logs;
CREATE POLICY "Admins manage override logs" ON public.admin_override_logs
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view compliance status" ON public.compliance_status;
CREATE POLICY "Admins view compliance status" ON public.compliance_status
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage breach notifications" ON public.data_breach_notifications;
CREATE POLICY "Admins manage breach notifications" ON public.data_breach_notifications
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view all export requests" ON public.data_export_requests;
DROP POLICY IF EXISTS "Users manage own export requests" ON public.data_export_requests;
CREATE POLICY "Admins view all export requests" ON public.data_export_requests
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users manage own export requests" ON public.data_export_requests
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 8. GRANTS: remove anonymous access, keep signed-in + server access
-- =========================================================
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
