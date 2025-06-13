
-- Create enum for different code types
CREATE TYPE public.code_type AS ENUM ('district', 'school', 'teacher', 'class');

-- Create access_codes table to manage all types of codes
CREATE TABLE public.access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  code_type public.code_type NOT NULL,
  target_id UUID, -- references district_id, school_id, class_id depending on type
  target_name TEXT NOT NULL, -- human readable name
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
  current_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}', -- flexible field for additional data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for access_codes
CREATE POLICY "Users can view codes they created" ON public.access_codes 
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "District admins can manage district and school codes" ON public.access_codes 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'district'
    )
  );

CREATE POLICY "School admins can manage teacher and class codes for their school" ON public.access_codes 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin' AND 
      (code_type IN ('teacher', 'class') AND target_id = p.school_id)
    )
  );

CREATE POLICY "Teachers can manage class codes for their classes" ON public.access_codes 
  FOR SELECT USING (
    code_type = 'class' AND 
    EXISTS (
      SELECT 1 FROM public.classes c 
      WHERE c.id = target_id AND c.teacher_id = auth.uid()
    )
  );

-- Function to generate unique codes
CREATE OR REPLACE FUNCTION public.generate_access_code(
  p_code_type public.code_type,
  p_target_id UUID,
  p_target_name TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_max_uses INTEGER DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  prefix TEXT;
BEGIN
  -- Set prefix based on code type
  CASE p_code_type
    WHEN 'district' THEN prefix := 'DIST';
    WHEN 'school' THEN prefix := 'SCH';
    WHEN 'teacher' THEN prefix := 'TCH';
    WHEN 'class' THEN prefix := 'CLS';
  END CASE;
  
  -- Generate unique code
  LOOP
    new_code := prefix || upper(substring(md5(random()::text) from 1 for 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.access_codes WHERE code = new_code);
  END LOOP;
  
  -- Insert the new code
  INSERT INTO public.access_codes (
    code, code_type, target_id, target_name, created_by, expires_at, max_uses
  ) VALUES (
    new_code, p_code_type, p_target_id, p_target_name, auth.uid(), p_expires_at, p_max_uses
  );
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process access codes
CREATE OR REPLACE FUNCTION public.process_access_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  code_record RECORD;
  result JSON;
BEGIN
  -- Find and validate the code
  SELECT * INTO code_record
  FROM public.access_codes
  WHERE code = upper(p_code) 
    AND active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses);
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid, expired, or used up access code'
    );
  END IF;
  
  -- Process based on code type
  CASE code_record.code_type
    WHEN 'district' THEN
      -- Make user a district admin
      UPDATE public.profiles 
      SET role = 'district', updated_at = now()
      WHERE id = auth.uid();
      
      -- Add to district_users table
      INSERT INTO public.district_users (user_id, district_id, role)
      VALUES (auth.uid(), code_record.target_id, 'admin')
      ON CONFLICT (user_id, district_id) DO UPDATE SET role = 'admin';
      
      result := json_build_object(
        'success', true,
        'message', 'You are now a district administrator for ' || code_record.target_name,
        'role', 'district',
        'assignment', code_record.target_name
      );
      
    WHEN 'school' THEN
      -- Make user a school admin
      UPDATE public.profiles 
      SET role = 'admin', school_id = code_record.target_id, updated_at = now()
      WHERE id = auth.uid();
      
      result := json_build_object(
        'success', true,
        'message', 'You are now a school administrator for ' || code_record.target_name,
        'role', 'admin',
        'assignment', code_record.target_name
      );
      
    WHEN 'teacher' THEN
      -- Make user a teacher
      UPDATE public.profiles 
      SET role = 'teacher', school_id = code_record.target_id, updated_at = now()
      WHERE id = auth.uid();
      
      result := json_build_object(
        'success', true,
        'message', 'You are now a teacher at ' || code_record.target_name,
        'role', 'teacher',
        'assignment', code_record.target_name
      );
      
    WHEN 'class' THEN
      -- Enroll student in class (existing logic)
      INSERT INTO public.student_enrollments (student_id, class_id)
      VALUES (auth.uid(), code_record.target_id)
      ON CONFLICT (student_id, class_id) DO NOTHING;
      
      -- Ensure user is a student
      UPDATE public.profiles 
      SET role = COALESCE(NULLIF(role, ''), 'student'), updated_at = now()
      WHERE id = auth.uid();
      
      result := json_build_object(
        'success', true,
        'message', 'You have been enrolled in ' || code_record.target_name,
        'role', 'student',
        'assignment', code_record.target_name
      );
  END CASE;
  
  -- Update usage count
  UPDATE public.access_codes 
  SET current_uses = current_uses + 1, updated_at = now()
  WHERE id = code_record.id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
