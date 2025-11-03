-- Create table for directory information opt-out preferences
CREATE TABLE IF NOT EXISTS public.directory_information_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name TEXT,
  parent_email TEXT,
  opted_out BOOLEAN NOT NULL DEFAULT false,
  opt_out_date TIMESTAMP WITH TIME ZONE,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year)
);

-- Enable RLS
ALTER TABLE public.directory_information_preferences ENABLE ROW LEVEL SECURITY;

-- Students can view their own preferences
CREATE POLICY "Students can view own directory preferences"
ON public.directory_information_preferences
FOR SELECT
USING (auth.uid() = student_id);

-- Students can update their own preferences
CREATE POLICY "Students can update own directory preferences"
ON public.directory_information_preferences
FOR UPDATE
USING (auth.uid() = student_id);

-- Students can insert their own preferences
CREATE POLICY "Students can insert own directory preferences"
ON public.directory_information_preferences
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Teachers can view preferences for their students
CREATE POLICY "Teachers can view student directory preferences"
ON public.directory_information_preferences
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = directory_information_preferences.student_id
      AND c.teacher_id = auth.uid()
  )
);

-- School admins can view preferences for students in their school
CREATE POLICY "Admins can view directory preferences in their school"
ON public.directory_information_preferences
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin
    JOIN public.student_enrollments se ON se.student_id = directory_information_preferences.student_id
    JOIN public.classes c ON c.id = se.class_id
    WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
      AND c.school_id = admin.school_id
  )
);

-- Create enhanced educational access logging table
CREATE TABLE IF NOT EXISTS public.educational_data_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL, -- 'view_grades', 'view_progress', 'view_profile', 'export_data', etc.
  data_category TEXT NOT NULL, -- 'educational_records', 'test_scores', 'personal_info', 'usage_data'
  data_accessed TEXT, -- Specific fields or data accessed
  educational_justification TEXT NOT NULL,
  legitimate_interest_verified BOOLEAN NOT NULL DEFAULT false,
  access_granted BOOLEAN NOT NULL DEFAULT false,
  denial_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_access_type CHECK (access_type IN (
    'view_grades', 'view_progress', 'view_profile', 'view_attendance',
    'view_usage', 'export_data', 'modify_records', 'view_test_results',
    'view_language_metrics', 'view_certifications'
  )),
  CONSTRAINT valid_data_category CHECK (data_category IN (
    'educational_records', 'test_scores', 'personal_info', 'usage_data',
    'language_metrics', 'certifications', 'attendance', 'behavioral_data'
  ))
);

-- Enable RLS on audit table
ALTER TABLE public.educational_data_access_audit ENABLE ROW LEVEL SECURITY;

-- Students can view their own access logs
CREATE POLICY "Students can view own access audit logs"
ON public.educational_data_access_audit
FOR SELECT
USING (auth.uid() = accessed_user_id);

-- Admins and teachers can view audit logs for their students
CREATE POLICY "Teachers and admins can view student access logs"
ON public.educational_data_access_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = educational_data_access_audit.accessed_user_id
      AND (c.teacher_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND school_id = c.school_id
      ))
  )
);

-- Create function to log educational data access with automatic verification
CREATE OR REPLACE FUNCTION public.log_educational_data_access(
  p_accessed_user_id UUID,
  p_access_type TEXT,
  p_data_category TEXT,
  p_data_accessed TEXT,
  p_justification TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_legitimate BOOLEAN := false;
  access_granted BOOLEAN := false;
  denial_reason TEXT := NULL;
  result JSON;
BEGIN
  -- Check if accessor is teacher of the student
  IF EXISTS (
    SELECT 1 FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = p_accessed_user_id
      AND c.teacher_id = auth.uid()
  ) THEN
    is_legitimate := true;
    access_granted := true;
  END IF;
  
  -- Check if accessor is admin of student's school
  IF NOT access_granted AND EXISTS (
    SELECT 1 FROM public.profiles accessor
    JOIN public.student_enrollments se ON se.student_id = p_accessed_user_id
    JOIN public.classes c ON c.id = se.class_id
    WHERE accessor.id = auth.uid()
      AND accessor.role = 'admin'
      AND c.school_id = accessor.school_id
  ) THEN
    is_legitimate := true;
    access_granted := true;
  END IF;
  
  -- Check if accessor is district admin
  IF NOT access_granted AND EXISTS (
    SELECT 1 FROM public.district_users du
    JOIN public.student_enrollments se ON se.student_id = p_accessed_user_id
    JOIN public.classes c ON c.id = se.class_id
    JOIN public.schools s ON s.id = c.school_id
    WHERE du.user_id = auth.uid()
      AND du.district_id = s.district_id
      AND du.role = 'admin'
  ) THEN
    is_legitimate := true;
    access_granted := true;
  END IF;
  
  -- Check if accessor is the student themselves
  IF NOT access_granted AND p_accessed_user_id = auth.uid() THEN
    is_legitimate := true;
    access_granted := true;
  END IF;
  
  -- Set denial reason if not granted
  IF NOT access_granted THEN
    denial_reason := 'No legitimate educational interest or authorization';
  END IF;
  
  -- Log the access attempt
  INSERT INTO public.educational_data_access_audit (
    accessed_user_id,
    accessor_user_id,
    access_type,
    data_category,
    data_accessed,
    educational_justification,
    legitimate_interest_verified,
    access_granted,
    denial_reason,
    ip_address,
    user_agent,
    session_id
  ) VALUES (
    p_accessed_user_id,
    auth.uid(),
    p_access_type,
    p_data_category,
    p_data_accessed,
    p_justification,
    is_legitimate,
    access_granted,
    denial_reason,
    p_ip_address,
    p_user_agent,
    p_session_id
  );
  
  result := json_build_object(
    'access_granted', access_granted,
    'legitimate_interest', is_legitimate,
    'denial_reason', denial_reason
  );
  
  RETURN result;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_directory_prefs_student ON public.directory_information_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_directory_prefs_academic_year ON public.directory_information_preferences(academic_year);
CREATE INDEX IF NOT EXISTS idx_edu_audit_accessed_user ON public.educational_data_access_audit(accessed_user_id);
CREATE INDEX IF NOT EXISTS idx_edu_audit_accessor_user ON public.educational_data_access_audit(accessor_user_id);
CREATE INDEX IF NOT EXISTS idx_edu_audit_accessed_at ON public.educational_data_access_audit(accessed_at);
CREATE INDEX IF NOT EXISTS idx_edu_audit_access_type ON public.educational_data_access_audit(access_type);

COMMENT ON TABLE public.directory_information_preferences IS 'FERPA-compliant directory information opt-out preferences per student per academic year';
COMMENT ON TABLE public.educational_data_access_audit IS 'Comprehensive audit log for all educational data access attempts with FERPA compliance verification';
COMMENT ON FUNCTION public.log_educational_data_access IS 'Logs educational data access with automatic legitimate educational interest verification';