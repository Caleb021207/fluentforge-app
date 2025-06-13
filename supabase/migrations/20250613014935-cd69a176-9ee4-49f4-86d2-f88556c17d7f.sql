
-- Add district role to the existing role check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin', 'district'));

-- Add district reference to schools table if not exists
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES public.school_districts(id);

-- Create enhanced student metrics table for usage tracking
CREATE TABLE IF NOT EXISTS public.student_usage_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  practice_sessions INTEGER DEFAULT 0,
  voice_chat_minutes INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  week_starting DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id, week_starting)
);

-- Create aggregated certification scores view
CREATE TABLE IF NOT EXISTS public.class_certification_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  avg_score NUMERIC,
  student_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  academic_year TEXT NOT NULL,
  UNIQUE(class_id, certification_type, academic_year)
);

-- Create school certification stats for district view
CREATE TABLE IF NOT EXISTS public.school_certification_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  avg_score NUMERIC,
  student_count INTEGER DEFAULT 0,
  class_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  academic_year TEXT NOT NULL,
  UNIQUE(school_id, certification_type, academic_year)
);

-- Enable RLS on new tables
ALTER TABLE public.student_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_certification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_certification_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_usage_metrics
CREATE POLICY "Students can view their own usage" ON public.student_usage_metrics FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers can view usage for their classes" ON public.student_usage_metrics FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = student_usage_metrics.class_id AND teacher_id = auth.uid()
  )
);
CREATE POLICY "Admins can view usage in their school" ON public.student_usage_metrics FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.classes c ON c.id = student_usage_metrics.class_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = c.school_id
  )
);

-- RLS policies for class_certification_stats
CREATE POLICY "Teachers can view their class stats" ON public.class_certification_stats FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = class_certification_stats.class_id AND teacher_id = auth.uid()
  )
);
CREATE POLICY "Admins can view class stats in their school" ON public.class_certification_stats FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.classes c ON c.id = class_certification_stats.class_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = c.school_id
  )
);

-- RLS policies for school_certification_stats
CREATE POLICY "Admins can view their school stats" ON public.school_certification_stats FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin' AND school_id = school_certification_stats.school_id
  )
);
CREATE POLICY "District users can view school stats in their district" ON public.school_certification_stats FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.district_users du
    JOIN public.schools s ON s.district_id = du.district_id
    WHERE du.user_id = auth.uid() AND s.id = school_certification_stats.school_id
  )
);

-- Create function to update certification stats
CREATE OR REPLACE FUNCTION update_certification_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update class stats
  INSERT INTO public.class_certification_stats (class_id, certification_type, avg_score, student_count, academic_year)
  SELECT 
    se.class_id,
    NEW.certification_type,
    AVG(ca.score),
    COUNT(DISTINCT ca.user_id),
    c.academic_year
  FROM public.certification_attempts ca
  JOIN public.student_enrollments se ON se.student_id = ca.user_id
  JOIN public.classes c ON c.id = se.class_id
  WHERE ca.certification_type = NEW.certification_type
    AND se.class_id = (
      SELECT se2.class_id 
      FROM public.student_enrollments se2 
      WHERE se2.student_id = NEW.user_id 
      LIMIT 1
    )
  GROUP BY se.class_id, c.academic_year
  ON CONFLICT (class_id, certification_type, academic_year)
  DO UPDATE SET 
    avg_score = EXCLUDED.avg_score,
    student_count = EXCLUDED.student_count,
    last_updated = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for certification stats updates
DROP TRIGGER IF EXISTS update_cert_stats_trigger ON public.certification_attempts;
CREATE TRIGGER update_cert_stats_trigger
  AFTER INSERT OR UPDATE ON public.certification_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_certification_stats();
