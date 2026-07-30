-- Make class join codes actually work.
--
-- Teachers see and share classes.class_code (e.g. CLS-A1B2C3), but nothing
-- ever read it: JoinClassForm only called process_access_code (the separate
-- access_codes table), and its validation regex rejected the hyphen anyway.
-- Students therefore had no working self-serve way to join a class.
--
-- join_class_by_code(p_code) enrolls the calling student in the class whose
-- class_code matches (case/whitespace-insensitive). SECURITY DEFINER because
-- students cannot SELECT classes they aren't enrolled in yet.

CREATE OR REPLACE FUNCTION public.join_class_by_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_class public.classes%ROWTYPE;
  v_user uuid := auth.uid();
  v_normalized text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not signed in');
  END IF;

  IF v_normalized = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Enter a class code');
  END IF;

  SELECT * INTO v_class
  FROM public.classes
  WHERE upper(class_code) = v_normalized
  LIMIT 1;

  IF v_class.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No class found for that code');
  END IF;

  IF v_class.teacher_id = v_user THEN
    RETURN jsonb_build_object('success', false, 'message', 'You are the teacher of this class');
  END IF;

  INSERT INTO public.student_enrollments (class_id, student_id, status)
  VALUES (v_class.id, v_user, 'active')
  ON CONFLICT (class_id, student_id)
  DO UPDATE SET status = 'active';

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Enrolled successfully',
    'class_id', v_class.id,
    'class_name', v_class.name
  );
END;
$$;

REVOKE ALL ON FUNCTION public.join_class_by_code(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.join_class_by_code(text) TO authenticated;
