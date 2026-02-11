
-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  account_tier TEXT DEFAULT 'premium',
  school_id UUID,
  native_language TEXT,
  target_language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, native_language, target_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'native_language',
    NEW.raw_user_meta_data->>'target_language'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- PROFILE PUBLIC DATA
-- =============================================
CREATE TABLE public.profile_public_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT,
  school_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_public_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public data viewable by all" ON public.profile_public_data FOR SELECT USING (true);
CREATE POLICY "Users update own public data" ON public.profile_public_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own public data" ON public.profile_public_data FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- USER ROLES
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- CLASSES
-- =============================================
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can manage own classes" ON public.classes FOR ALL USING (auth.uid() = teacher_id);

-- =============================================
-- STUDENT ENROLLMENTS
-- =============================================
CREATE TABLE public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can view class enrollments" ON public.student_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.classes WHERE id = class_id AND teacher_id = auth.uid())
);
CREATE POLICY "Students can view own enrollments" ON public.student_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own enrollment" ON public.student_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers can delete enrollments" ON public.student_enrollments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.classes WHERE id = class_id AND teacher_id = auth.uid())
);

-- Now add the deferred policy for classes
CREATE POLICY "Students can view enrolled classes" ON public.classes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.student_enrollments WHERE class_id = id AND student_id = auth.uid())
);

-- =============================================
-- USAGE TRACKING
-- =============================================
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  session_id TEXT,
  messages_count INTEGER DEFAULT 0,
  minutes_used NUMERIC DEFAULT 0,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tracking" ON public.usage_tracking FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own tracking" ON public.usage_tracking FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update own tracking" ON public.usage_tracking FOR UPDATE USING (auth.uid() = student_id);

-- =============================================
-- STUDENT USAGE LIMITS
-- =============================================
CREATE TABLE public.student_usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_minutes_monthly_limit INTEGER DEFAULT 400,
  voice_minutes_used_current_month INTEGER DEFAULT 0,
  premium_voice_minutes_monthly_limit INTEGER DEFAULT 15,
  premium_voice_minutes_used_current_month NUMERIC DEFAULT 0,
  whisper_stt_minutes_monthly_limit INTEGER DEFAULT 180,
  whisper_stt_minutes_used_current_month NUMERIC DEFAULT 0,
  tts_tokens_monthly_limit INTEGER DEFAULT 500000,
  tts_tokens_used_current_month INTEGER DEFAULT 0,
  text_practice_tokens_monthly_limit INTEGER DEFAULT 500000,
  text_practice_tokens_used_current_month INTEGER DEFAULT 0,
  text_messages_monthly_limit INTEGER DEFAULT 1500,
  text_messages_used_current_month INTEGER DEFAULT 0,
  certification_attempts_semester_limit INTEGER DEFAULT 3,
  certification_attempts_used_current_semester INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_usage_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own limits" ON public.student_usage_limits FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can update own limits" ON public.student_usage_limits FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own limits" ON public.student_usage_limits FOR INSERT WITH CHECK (auth.uid() = student_id);

-- =============================================
-- ADMIN OVERRIDE LOGS
-- =============================================
CREATE TABLE public.admin_override_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  override_type TEXT NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_override_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage override logs" ON public.admin_override_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- ACCESS CODES
-- =============================================
CREATE TABLE public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  code_type TEXT NOT NULL DEFAULT 'class',
  target_id UUID,
  created_by UUID REFERENCES auth.users(id),
  max_uses INTEGER DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators can manage own codes" ON public.access_codes FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Anyone can read active codes" ON public.access_codes FOR SELECT USING (is_active = true);

-- =============================================
-- CERTIFICATION ATTEMPTS
-- =============================================
CREATE TABLE public.certification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  score NUMERIC DEFAULT 0,
  level TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certification_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON public.certification_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.certification_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON public.certification_attempts FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- CERTIFICATION TRANSCRIPTS
-- =============================================
CREATE TABLE public.certification_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.certification_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_transcripts JSONB,
  ai_responses JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certification_transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transcripts" ON public.certification_transcripts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transcripts" ON public.certification_transcripts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRANSCRIPT ANALYSES
-- =============================================
CREATE TABLE public.transcript_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cefr_level TEXT,
  overall_score NUMERIC,
  analysis_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transcript_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses" ON public.transcript_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.transcript_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STUDY RECOMMENDATIONS
-- =============================================
CREATE TABLE public.study_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES public.transcript_analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT,
  title TEXT,
  description TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.study_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recommendations" ON public.study_recommendations FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- STUDENT METRICS
-- =============================================
CREATE TABLE public.student_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  text_practice_calls INTEGER DEFAULT 0,
  premium_voice_calls INTEGER DEFAULT 0,
  avg_grammar_accuracy NUMERIC DEFAULT 0,
  avg_conversation_complexity NUMERIC DEFAULT 0,
  language_metrics_count INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own metrics" ON public.student_metrics FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can update own metrics" ON public.student_metrics FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own metrics" ON public.student_metrics FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers can view student metrics" ON public.student_metrics FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = student_metrics.student_id AND c.teacher_id = auth.uid()
  )
);

-- =============================================
-- STUDENT LANGUAGE METRICS
-- =============================================
CREATE TABLE public.student_language_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  classroom_id UUID,
  grammar_accuracy NUMERIC DEFAULT 0,
  conversation_complexity NUMERIC DEFAULT 0,
  pronunciation_accuracy NUMERIC DEFAULT 0,
  vocabulary_diversity NUMERIC DEFAULT 0,
  fluency_score NUMERIC DEFAULT 0,
  analysis_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_language_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own language metrics" ON public.student_language_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own language metrics" ON public.student_language_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- USER PROGRESSION
-- =============================================
CREATE TABLE public.user_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_multiplier NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_progression ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all progression" ON public.user_progression FOR SELECT USING (true);
CREATE POLICY "Users can update own progression" ON public.user_progression FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progression" ON public.user_progression FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- PERSONALIZED FLASHCARDS
-- =============================================
CREATE TABLE public.personalized_flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT,
  example TEXT,
  category TEXT,
  cefr_level TEXT,
  source_type TEXT DEFAULT 'manual',
  mastery_level INTEGER DEFAULT 0,
  next_due TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.personalized_flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own flashcards" ON public.personalized_flashcards FOR ALL USING (auth.uid() = student_id);

-- =============================================
-- RECENT PHRASES
-- =============================================
CREATE TABLE public.recent_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase TEXT NOT NULL,
  level TEXT,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recent_phrases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read phrases" ON public.recent_phrases FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert phrases" ON public.recent_phrases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- ASSIGNMENTS
-- =============================================
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  topic_prompt TEXT NOT NULL,
  cefr_level TEXT DEFAULT 'B1',
  min_messages INTEGER DEFAULT 10,
  max_duration_minutes INTEGER DEFAULT 15,
  grammar_requirements JSONB,
  due_date TIMESTAMPTZ,
  points_possible INTEGER DEFAULT 100,
  assignment_mode TEXT DEFAULT 'text_practice',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can manage own assignments" ON public.assignments FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Students can view class assignments" ON public.assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.student_enrollments WHERE class_id = assignments.class_id AND student_id = auth.uid())
);

-- =============================================
-- ASSIGNMENT SUBMISSIONS
-- =============================================
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress',
  messages JSONB,
  message_count INTEGER DEFAULT 0,
  score NUMERIC,
  teacher_override_score NUMERIC,
  teacher_notes TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can manage own submissions" ON public.assignment_submissions FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view class submissions" ON public.assignment_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND a.teacher_id = auth.uid())
);
CREATE POLICY "Teachers can update class submissions" ON public.assignment_submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND a.teacher_id = auth.uid())
);

-- =============================================
-- EDUCATIONAL DATA ACCESS AUDIT
-- =============================================
CREATE TABLE public.educational_data_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_user_id UUID NOT NULL REFERENCES auth.users(id),
  accessed_user_id UUID NOT NULL REFERENCES auth.users(id),
  data_type TEXT NOT NULL,
  access_purpose TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.educational_data_access_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own access logs" ON public.educational_data_access_audit FOR SELECT USING (auth.uid() = accessed_user_id);

-- =============================================
-- API CALLS TRACKING
-- =============================================
CREATE TABLE public.api_calls_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_type TEXT,
  tokens_used INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_calls_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own api tracking" ON public.api_calls_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own api tracking" ON public.api_calls_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- DISTRICT USERS
-- =============================================
CREATE TABLE public.district_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  district_id UUID,
  role TEXT DEFAULT 'student',
  consent_provided BOOLEAN DEFAULT false,
  consent_type TEXT,
  consent_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.district_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own district data" ON public.district_users FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- RPC FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.initialize_student_usage_limits_with_tier(p_student_id UUID, p_account_tier TEXT DEFAULT 'premium')
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.student_usage_limits (student_id) VALUES (p_student_id) ON CONFLICT (student_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.initialize_student_usage_limits(target_student_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.student_usage_limits (student_id) VALUES (target_student_id) ON CONFLICT (student_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_start_voice_session(target_student_id UUID)
RETURNS JSON AS $$
DECLARE
  limits_row public.student_usage_limits%ROWTYPE;
BEGIN
  SELECT * INTO limits_row FROM public.student_usage_limits WHERE student_id = target_student_id;
  IF NOT FOUND THEN
    PERFORM public.initialize_student_usage_limits(target_student_id);
    RETURN json_build_object('allowed', true, 'reason', 'new_user');
  END IF;
  IF limits_row.voice_minutes_used_current_month >= limits_row.voice_minutes_monthly_limit THEN
    RETURN json_build_object('allowed', false, 'reason', 'limit_reached');
  END IF;
  RETURN json_build_object('allowed', true, 'minutesRemaining', limits_row.voice_minutes_monthly_limit - limits_row.voice_minutes_used_current_month);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_send_text_message(p_student_id UUID)
RETURNS TABLE(can_send BOOLEAN, reason TEXT, messages_used INTEGER, messages_limit INTEGER, messages_remaining INTEGER) AS $$
DECLARE
  limits_row public.student_usage_limits%ROWTYPE;
BEGIN
  SELECT * INTO limits_row FROM public.student_usage_limits WHERE student_id = p_student_id;
  IF NOT FOUND THEN
    PERFORM public.initialize_student_usage_limits(p_student_id);
    RETURN QUERY SELECT true, 'new_user'::TEXT, 0, 1500, 1500;
    RETURN;
  END IF;
  IF limits_row.text_messages_used_current_month >= limits_row.text_messages_monthly_limit THEN
    RETURN QUERY SELECT false, 'limit_reached'::TEXT, limits_row.text_messages_used_current_month, limits_row.text_messages_monthly_limit, 0;
  ELSE
    RETURN QUERY SELECT true, 'ok'::TEXT, limits_row.text_messages_used_current_month, limits_row.text_messages_monthly_limit, limits_row.text_messages_monthly_limit - limits_row.text_messages_used_current_month;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_start_premium_voice_session(target_student_id UUID)
RETURNS JSON AS $$
DECLARE
  limits_row public.student_usage_limits%ROWTYPE;
BEGIN
  SELECT * INTO limits_row FROM public.student_usage_limits WHERE student_id = target_student_id;
  IF NOT FOUND THEN
    RETURN json_build_object('allowed', true, 'reason', 'new_user');
  END IF;
  IF limits_row.premium_voice_minutes_used_current_month >= limits_row.premium_voice_minutes_monthly_limit THEN
    RETURN json_build_object('allowed', false, 'reason', 'limit_reached');
  END IF;
  RETURN json_build_object('allowed', true, 'minutesRemaining', limits_row.premium_voice_minutes_monthly_limit - limits_row.premium_voice_minutes_used_current_month);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_tts_usage(p_student_id UUID, p_minutes NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.student_usage_limits SET tts_tokens_used_current_month = tts_tokens_used_current_month + GREATEST(1, p_minutes::INTEGER), updated_at = now() WHERE student_id = p_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_voice_usage(p_user_id UUID, p_minutes NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.student_usage_limits SET voice_minutes_used_current_month = voice_minutes_used_current_month + GREATEST(1, p_minutes::INTEGER), updated_at = now() WHERE student_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_student_practice_counts(target_student_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.student_metrics (student_id, text_practice_calls, premium_voice_calls, last_activity)
  VALUES (target_student_id, 0, 0, now())
  ON CONFLICT (student_id) DO UPDATE SET last_activity = now(), updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.recalculate_student_metrics(target_student_id UUID)
RETURNS VOID AS $$
DECLARE
  avg_grammar NUMERIC; avg_complexity NUMERIC; metrics_count INTEGER; text_calls INTEGER; voice_calls INTEGER;
BEGIN
  SELECT COALESCE(AVG(grammar_accuracy), 0), COALESCE(AVG(conversation_complexity), 0), COUNT(*)
  INTO avg_grammar, avg_complexity, metrics_count FROM public.student_language_metrics WHERE user_id = target_student_id;
  SELECT COUNT(*) INTO text_calls FROM public.usage_tracking WHERE student_id = target_student_id AND session_type = 'text_practice';
  SELECT COUNT(*) INTO voice_calls FROM public.usage_tracking WHERE student_id = target_student_id AND session_type IN ('voice_practice', 'premium_voice_practice');
  INSERT INTO public.student_metrics (student_id, avg_grammar_accuracy, avg_conversation_complexity, language_metrics_count, text_practice_calls, premium_voice_calls, last_activity)
  VALUES (target_student_id, avg_grammar, avg_complexity, metrics_count, text_calls, voice_calls, now())
  ON CONFLICT (student_id) DO UPDATE SET avg_grammar_accuracy = avg_grammar, avg_conversation_complexity = avg_complexity, language_metrics_count = metrics_count, text_practice_calls = text_calls, premium_voice_calls = voice_calls, last_activity = now(), updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_student_language_aggregate_metrics(target_student_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM public.recalculate_student_metrics(target_student_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_flashcard_mastery(p_flashcard_id UUID, p_quality INTEGER)
RETURNS VOID AS $$
DECLARE
  new_mastery INTEGER; new_due TIMESTAMPTZ;
BEGIN
  SELECT mastery_level INTO new_mastery FROM public.personalized_flashcards WHERE id = p_flashcard_id;
  IF p_quality >= 3 THEN new_mastery := LEAST(new_mastery + 1, 5);
  ELSE new_mastery := GREATEST(new_mastery - 1, 0); END IF;
  new_due := now() + (POWER(2, new_mastery) || ' days')::INTERVAL;
  UPDATE public.personalized_flashcards SET mastery_level = new_mastery, next_due = new_due, updated_at = now() WHERE id = p_flashcard_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.process_access_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  code_row public.access_codes%ROWTYPE;
BEGIN
  SELECT * INTO code_row FROM public.access_codes WHERE code = p_code AND is_active = true;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'message', 'Invalid code'); END IF;
  IF code_row.max_uses IS NOT NULL AND code_row.current_uses >= code_row.max_uses THEN
    RETURN json_build_object('success', false, 'message', 'Code has reached maximum uses'); END IF;
  IF code_row.expires_at IS NOT NULL AND code_row.expires_at < now() THEN
    RETURN json_build_object('success', false, 'message', 'Code has expired'); END IF;
  UPDATE public.access_codes SET current_uses = current_uses + 1 WHERE id = code_row.id;
  IF code_row.code_type = 'class' AND code_row.target_id IS NOT NULL THEN
    INSERT INTO public.student_enrollments (class_id, student_id) VALUES (code_row.target_id, auth.uid()) ON CONFLICT (class_id, student_id) DO NOTHING;
  END IF;
  RETURN json_build_object('success', true, 'code_type', code_row.code_type, 'target_id', code_row.target_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_access_code(p_code_type TEXT, p_target_id UUID, p_max_uses INTEGER DEFAULT 100, p_expires_in_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  new_code TEXT; result_id UUID;
BEGIN
  new_code := upper(substr(md5(random()::text), 1, 8));
  INSERT INTO public.access_codes (code, code_type, target_id, created_by, max_uses, expires_at)
  VALUES (new_code, p_code_type, p_target_id, auth.uid(), p_max_uses, now() + (p_expires_in_days || ' days')::INTERVAL)
  RETURNING id INTO result_id;
  RETURN json_build_object('success', true, 'code', new_code, 'id', result_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id UUID, p_action_type TEXT, p_max_attempts INTEGER DEFAULT 5, p_window_minutes INTEGER DEFAULT 15)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_usage_limits_updated_at BEFORE UPDATE ON public.student_usage_limits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_metrics_updated_at BEFORE UPDATE ON public.student_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_progression_updated_at BEFORE UPDATE ON public.user_progression FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON public.personalized_flashcards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
