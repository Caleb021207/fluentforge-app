
-- 1) Add missing columns to api_calls_tracking
ALTER TABLE public.api_calls_tracking 
  ADD COLUMN IF NOT EXISTS service text,
  ADD COLUMN IF NOT EXISTS endpoint text;

-- 2) Create trigger for auto-creating profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, native_language, target_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'native_language',
    NEW.raw_user_meta_data->>'target_language'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) Create missing increment_tts_token_usage function
CREATE OR REPLACE FUNCTION public.increment_tts_token_usage(p_user_id uuid, p_tokens integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.student_usage_limits 
  SET tts_tokens_used_current_month = tts_tokens_used_current_month + GREATEST(1, p_tokens),
      updated_at = now() 
  WHERE student_id = p_user_id;
END;
$$;

-- 4) Create missing increment_stt_usage function
CREATE OR REPLACE FUNCTION public.increment_stt_usage(p_student_id uuid, p_minutes integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.student_usage_limits 
  SET whisper_stt_minutes_used_current_month = whisper_stt_minutes_used_current_month + GREATEST(1, p_minutes),
      updated_at = now() 
  WHERE student_id = p_student_id;
END;
$$;
