CREATE TABLE public.class_curriculum_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL,
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions text,
  due_date timestamptz,
  target_cefr_levels text[] NOT NULL DEFAULT '{}',
  target_wida_min integer,
  target_wida_max integer,
  group_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_curriculum_assignments_target CHECK (unit_id IS NOT NULL OR lesson_id IS NOT NULL)
);

CREATE INDEX idx_cca_class ON public.class_curriculum_assignments(class_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_curriculum_assignments TO authenticated;
GRANT ALL ON public.class_curriculum_assignments TO service_role;
ALTER TABLE public.class_curriculum_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage curriculum assignments for their classes"
  ON public.class_curriculum_assignments FOR ALL TO authenticated
  USING (public.is_teacher_of_class(auth.uid(), class_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_teacher_of_class(auth.uid(), class_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students view curriculum assignments for their classes"
  ON public.class_curriculum_assignments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.student_enrollments se
    WHERE se.class_id = class_curriculum_assignments.class_id
      AND se.student_id = auth.uid()
  ));

CREATE TRIGGER cca_set_updated_at
  BEFORE UPDATE ON public.class_curriculum_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.roster_sync_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL CHECK (provider IN ('clever','google_classroom','oneroster')),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  external_id text,
  status text NOT NULL DEFAULT 'not_connected' CHECK (status IN ('not_connected','pending','connected','error')),
  last_synced_at timestamptz,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roster_sync_connections TO authenticated;
GRANT ALL ON public.roster_sync_connections TO service_role;
ALTER TABLE public.roster_sync_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage roster connections"
  ON public.roster_sync_connections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER roster_sync_set_updated_at
  BEFORE UPDATE ON public.roster_sync_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Teachers add students to their classes"
  ON public.student_enrollments FOR INSERT TO authenticated
  WITH CHECK (public.is_teacher_of_class(auth.uid(), class_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers update enrollments in their classes"
  ON public.student_enrollments FOR UPDATE TO authenticated
  USING (public.is_teacher_of_class(auth.uid(), class_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_teacher_of_class(auth.uid(), class_id) OR public.has_role(auth.uid(), 'admin'));