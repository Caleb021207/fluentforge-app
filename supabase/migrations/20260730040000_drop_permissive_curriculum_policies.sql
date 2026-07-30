-- Remove the legacy anyone-can-read curriculum policies.
--
-- 20251021193032 created "Anyone can view ..." USING (true) policies, and
-- 20260729164446 added the intended status-scoped replacements
-- (courses_read/units_read/skills_read/lessons_read/exercises_read) without
-- dropping the old ones. Multiple permissive policies OR together, so draft
-- and archived content was still readable (and rendered as clickable lessons
-- that then failed to open). Dropping the legacy policies makes the
-- status-scoped ones authoritative.

DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view units" ON public.units;
DROP POLICY IF EXISTS "Anyone can view skills" ON public.skills;
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Anyone can view exercises" ON public.exercises;
