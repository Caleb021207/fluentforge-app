-- Create student usage limits table
CREATE TABLE public.student_usage_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT,
  voice_minutes_monthly_limit INTEGER NOT NULL DEFAULT 400,
  voice_minutes_used_current_month INTEGER NOT NULL DEFAULT 0,
  text_messages_monthly_limit INTEGER DEFAULT NULL, -- NULL = unlimited
  text_messages_used_current_month INTEGER NOT NULL DEFAULT 0,
  certification_attempts_semester_limit INTEGER NOT NULL DEFAULT 3,
  certification_attempts_used_current_semester INTEGER NOT NULL DEFAULT 0,
  current_month DATE NOT NULL DEFAULT DATE_TRUNC('month', NOW()),
  current_semester TEXT NOT NULL DEFAULT CASE 
    WHEN EXTRACT(MONTH FROM NOW()) >= 1 AND EXTRACT(MONTH FROM NOW()) <= 6 THEN 'spring'
    ELSE 'fall'
  END,
  last_reset_month TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reset_semester TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, academic_year)
);

-- Create detailed usage tracking table
CREATE TABLE public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('voice_practice', 'text_chat', 'certification')),
  session_id TEXT,
  minutes_used INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create time restrictions table
CREATE TABLE public.time_restrictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID,
  class_id UUID,
  student_id UUID,
  restriction_type TEXT NOT NULL CHECK (restriction_type IN ('school_hours', 'homework_mode', 'custom')),
  allowed_days INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL DEFAULT '07:00:00',
  end_time TIME NOT NULL DEFAULT '16:00:00',
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create admin override logs table
CREATE TABLE public.admin_override_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  student_id UUID NOT NULL,
  override_type TEXT NOT NULL CHECK (override_type IN ('extra_minutes', 'cert_reset', 'after_hours', 'emergency_unlock')),
  previous_value INTEGER,
  new_value INTEGER,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.student_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_override_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_usage_limits
CREATE POLICY "Students can view their own usage limits" 
ON public.student_usage_limits 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own usage limits" 
ON public.student_usage_limits 
FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view student limits in their classes" 
ON public.student_usage_limits 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM student_enrollments se
  JOIN classes c ON c.id = se.class_id
  WHERE se.student_id = student_usage_limits.student_id 
  AND c.teacher_id = auth.uid()
));

CREATE POLICY "Admins can view student limits in their school" 
ON public.student_usage_limits 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles admin_profile, profiles student_profile
  WHERE admin_profile.id = auth.uid() 
  AND admin_profile.role = 'admin'
  AND student_profile.id = student_usage_limits.student_id
  AND student_profile.school_id = admin_profile.school_id
));

-- RLS Policies for usage_tracking
CREATE POLICY "Students can insert their own usage tracking" 
ON public.usage_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own usage tracking" 
ON public.usage_tracking 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view usage tracking for their students" 
ON public.usage_tracking 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM student_enrollments se
  JOIN classes c ON c.id = se.class_id
  WHERE se.student_id = usage_tracking.student_id 
  AND c.teacher_id = auth.uid()
));

CREATE POLICY "Admins can view usage tracking in their school" 
ON public.usage_tracking 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles admin_profile, profiles student_profile
  WHERE admin_profile.id = auth.uid() 
  AND admin_profile.role = 'admin'
  AND student_profile.id = usage_tracking.student_id
  AND student_profile.school_id = admin_profile.school_id
));

-- RLS Policies for time_restrictions
CREATE POLICY "Students can view their own time restrictions" 
ON public.time_restrictions 
FOR SELECT 
USING (auth.uid() = student_id OR EXISTS (
  SELECT 1 FROM student_enrollments se
  WHERE se.student_id = auth.uid() 
  AND se.class_id = time_restrictions.class_id
));

CREATE POLICY "Teachers can manage time restrictions for their classes" 
ON public.time_restrictions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM classes c
  WHERE c.id = time_restrictions.class_id 
  AND c.teacher_id = auth.uid()
));

CREATE POLICY "Admins can manage time restrictions in their school" 
ON public.time_restrictions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p, schools s
  WHERE p.id = auth.uid() 
  AND p.role = 'admin'
  AND p.school_id = s.id
  AND s.id = time_restrictions.school_id
));

-- RLS Policies for admin_override_logs
CREATE POLICY "Admins can insert override logs" 
ON public.admin_override_logs 
FOR INSERT 
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can view override logs in their scope" 
ON public.admin_override_logs 
FOR SELECT 
USING (auth.uid() = admin_id OR EXISTS (
  SELECT 1 FROM profiles admin_profile, profiles student_profile
  WHERE admin_profile.id = auth.uid() 
  AND admin_profile.role IN ('admin', 'teacher')
  AND student_profile.id = admin_override_logs.student_id
  AND (
    -- Same school for admins
    (admin_profile.role = 'admin' AND student_profile.school_id = admin_profile.school_id)
    OR
    -- Same class for teachers
    (admin_profile.role = 'teacher' AND EXISTS (
      SELECT 1 FROM student_enrollments se
      JOIN classes c ON c.id = se.class_id
      WHERE se.student_id = student_profile.id 
      AND c.teacher_id = admin_profile.id
    ))
  )
));

-- Create indexes for performance
CREATE INDEX idx_student_usage_limits_student_id ON public.student_usage_limits(student_id);
CREATE INDEX idx_student_usage_limits_academic_year ON public.student_usage_limits(academic_year);
CREATE INDEX idx_usage_tracking_student_id ON public.usage_tracking(student_id);
CREATE INDEX idx_usage_tracking_session_type ON public.usage_tracking(session_type);
CREATE INDEX idx_usage_tracking_started_at ON public.usage_tracking(started_at);
CREATE INDEX idx_time_restrictions_student_id ON public.time_restrictions(student_id);
CREATE INDEX idx_time_restrictions_class_id ON public.time_restrictions(class_id);
CREATE INDEX idx_admin_override_logs_student_id ON public.admin_override_logs(student_id);

-- Create function to initialize student usage limits
CREATE OR REPLACE FUNCTION public.initialize_student_usage_limits(target_student_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_academic_year TEXT;
BEGIN
  current_academic_year := EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT;
  
  INSERT INTO public.student_usage_limits (student_id, academic_year)
  VALUES (target_student_id, current_academic_year)
  ON CONFLICT (student_id, academic_year) DO NOTHING;
END;
$$;

-- Create function to reset monthly usage
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.student_usage_limits
  SET 
    voice_minutes_used_current_month = 0,
    text_messages_used_current_month = 0,
    current_month = DATE_TRUNC('month', NOW()),
    last_reset_month = NOW(),
    updated_at = NOW()
  WHERE current_month < DATE_TRUNC('month', NOW());
END;
$$;

-- Create function to reset semester usage
CREATE OR REPLACE FUNCTION public.reset_semester_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_semester TEXT;
BEGIN
  new_semester := CASE 
    WHEN EXTRACT(MONTH FROM NOW()) >= 1 AND EXTRACT(MONTH FROM NOW()) <= 6 THEN 'spring'
    ELSE 'fall'
  END;
  
  UPDATE public.student_usage_limits
  SET 
    certification_attempts_used_current_semester = 0,
    current_semester = new_semester,
    last_reset_semester = NOW(),
    updated_at = NOW()
  WHERE current_semester != new_semester;
END;
$$;

-- Create function to check if student can start voice session
CREATE OR REPLACE FUNCTION public.can_start_voice_session(target_student_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  usage_record RECORD;
  time_restriction RECORD;
  current_day INTEGER;
  check_time TIME;
  result JSON;
BEGIN
  -- Get usage limits
  SELECT * INTO usage_record
  FROM public.student_usage_limits
  WHERE student_id = target_student_id
    AND academic_year = EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT;
  
  IF NOT FOUND THEN
    -- Initialize if not exists
    PERFORM public.initialize_student_usage_limits(target_student_id);
    SELECT * INTO usage_record
    FROM public.student_usage_limits
    WHERE student_id = target_student_id
      AND academic_year = EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT;
  END IF;
  
  -- Check voice minutes limit
  IF usage_record.voice_minutes_used_current_month >= usage_record.voice_minutes_monthly_limit THEN
    result := json_build_object(
      'allowed', false,
      'reason', 'monthly_voice_limit_reached',
      'minutes_used', usage_record.voice_minutes_used_current_month,
      'minutes_limit', usage_record.voice_minutes_monthly_limit
    );
    RETURN result;
  END IF;
  
  -- Check time restrictions
  current_day := EXTRACT(DOW FROM NOW()); -- 0=Sunday, 6=Saturday
  current_day := CASE WHEN current_day = 0 THEN 7 ELSE current_day END; -- Convert to 1=Monday, 7=Sunday
  check_time := NOW()::TIME;
  
  SELECT * INTO time_restriction
  FROM public.time_restrictions
  WHERE (student_id = target_student_id OR class_id IN (
    SELECT class_id FROM student_enrollments WHERE student_id = target_student_id
  ))
    AND is_active = true
    AND current_day = ANY(allowed_days)
    AND check_time BETWEEN start_time AND end_time
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- Check if there's an active restriction that's currently blocking
    SELECT * INTO time_restriction
    FROM public.time_restrictions
    WHERE (student_id = target_student_id OR class_id IN (
      SELECT class_id FROM student_enrollments WHERE student_id = target_student_id
    ))
      AND is_active = true
    LIMIT 1;
    
    IF FOUND THEN
      result := json_build_object(
        'allowed', false,
        'reason', 'outside_allowed_hours',
        'allowed_days', time_restriction.allowed_days,
        'start_time', time_restriction.start_time,
        'end_time', time_restriction.end_time
      );
      RETURN result;
    END IF;
  END IF;
  
  -- All checks passed
  result := json_build_object(
    'allowed', true,
    'minutes_remaining', usage_record.voice_minutes_monthly_limit - usage_record.voice_minutes_used_current_month,
    'minutes_used', usage_record.voice_minutes_used_current_month,
    'minutes_limit', usage_record.voice_minutes_monthly_limit
  );
  
  RETURN result;
END;
$$;