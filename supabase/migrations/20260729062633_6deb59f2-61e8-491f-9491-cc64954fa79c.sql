-- Tighten the public profile directory: no signed-in user should be able to
-- enumerate every student in every school.

DROP POLICY IF EXISTS "Authenticated view public profile data" ON public.profile_public_data;

CREATE OR REPLACE FUNCTION public.same_school_as(_viewer uuid, _target uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles v
    JOIN public.profiles t ON t.id = _target
    WHERE v.id = _viewer
      AND v.school_id IS NOT NULL
      AND v.school_id = t.school_id
  );
$$;

CREATE POLICY "Members view profile directory in scope"
ON public.profile_public_data
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.same_school_as(auth.uid(), user_id)
  OR public.is_teacher_of_student(auth.uid(), user_id)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);