-- Allow onboarding to set the display role between 'student' and 'teacher'.
--
-- protect_profile_privileged_columns (20260729061713) froze profiles.role for
-- all non-admin writes, which silently broke the onboarding wizard's teacher
-- path: the update succeeded but role stayed 'student', so new teachers were
-- never recognized. Teacher *powers* are enforced by class ownership
-- (is_teacher_of_class / is_teacher_of_student RLS), and any authenticated
-- user may create a class for themselves, so restricting the student<->teacher
-- display role provided no security benefit.
--
-- This version keeps every privileged column frozen (tier, school, consent,
-- safety, etc.) and still blocks escalation to any other role value
-- ('admin', 'district', ...). Only 'student' <-> 'teacher' changes pass.

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  is_privileged boolean := (auth.uid() IS NULL) OR public.has_role(auth.uid(), 'admin');
BEGIN
  IF is_privileged THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := COALESCE(NULLIF(NEW.role, ''), 'student');
    IF NEW.role NOT IN ('student', 'teacher') THEN NEW.role := 'student'; END IF;
    NEW.account_tier := 'free';
    NEW.school_id := NULL;
    NEW.grade_level_id := NULL;
    NEW.parental_consent_granted := false;
    NEW.parental_consent_at := NULL;
    NEW.age_verified_at := NULL;
    RETURN NEW;
  END IF;

  -- UPDATE: users may only switch their own display role between student and
  -- teacher; every other role value (and all other privileged columns) is
  -- preserved from the existing row.
  IF NEW.role IS DISTINCT FROM OLD.role
     AND NEW.role IN ('student', 'teacher')
     AND OLD.role IN ('student', 'teacher') THEN
    NULL; -- permitted transition, keep NEW.role
  ELSE
    NEW.role := OLD.role;
  END IF;

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
