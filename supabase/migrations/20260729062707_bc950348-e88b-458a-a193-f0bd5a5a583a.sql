-- Privileged SECURITY DEFINER routines must not be callable straight from the
-- browser: they bypass RLS. Only server-side (service_role) code may run them.
DO $$
DECLARE
  fn text;
  privileged text[] := ARRAY[
    'increment_tts_usage(uuid,numeric)',
    'increment_tts_token_usage(uuid,integer)',
    'increment_voice_usage(uuid,numeric)',
    'increment_stt_usage(uuid,integer)',
    'initialize_student_usage_limits(uuid)',
    'initialize_student_usage_limits_with_tier(uuid,text)',
    'recalculate_student_metrics(uuid)',
    'update_student_metrics_from_language_data(uuid)',
    'update_student_language_aggregate_metrics(uuid)',
    'update_student_practice_counts(uuid)',
    'update_flashcard_mastery(uuid,integer)',
    'get_user_last_sign_in(uuid)',
    'check_rate_limit(uuid,text,integer,integer)',
    'consume_rate_limit(uuid,text,integer)',
    'generate_access_code(text,uuid,integer,integer)',
    'generate_access_code(text,uuid,text,timestamptz,integer)'
  ];
BEGIN
  FOREACH fn IN ARRAY privileged LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skipping missing function %', fn;
    END;
  END LOOP;
END $$;

-- Helpers referenced by RLS policies (and the legitimate in-app checks) must
-- stay executable by signed-in users, otherwise normal access breaks.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_teacher_of_class(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_teacher_of_student(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.same_school_as(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_start_voice_session(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_start_premium_voice_session(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_send_text_message(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_access_code(text) TO authenticated, service_role;