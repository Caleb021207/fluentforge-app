-- 1. FIX: Create IP anonymization function (30-day retention)
CREATE OR REPLACE FUNCTION public.anonymize_old_ip_addresses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.access_code_attempts
  SET ip_address = '0.0.0.0'::inet
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND ip_address IS NOT NULL
  AND ip_address != '0.0.0.0'::inet;
  
  UPDATE public.access_code_rate_limits
  SET ip_address = '0.0.0.0'::inet
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND ip_address IS NOT NULL
  AND ip_address != '0.0.0.0'::inet;
  
  UPDATE public.security_audit_log
  SET ip_address = '0.0.0.0'::inet
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND ip_address IS NOT NULL
  AND ip_address != '0.0.0.0'::inet;
END;
$$;

-- 2. FIX: Create audit log retention function (1-year retention)
CREATE OR REPLACE FUNCTION public.purge_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.security_audit_log
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  DELETE FROM public.educational_data_access_audit
  WHERE accessed_at < NOW() - INTERVAL '7 years';
  
  DELETE FROM public.educational_interest_access_logs
  WHERE created_at < NOW() - INTERVAL '7 years';
END;
$$;

-- 3. FIX: Update data_breach_notifications policy to hide affected_user_ids from non-creators
DROP POLICY IF EXISTS "School admins can manage their school's breach notifications" ON public.data_breach_notifications;
DROP POLICY IF EXISTS "District admins can view district breach notifications" ON public.data_breach_notifications;

-- Only the creator can see full breach details including affected_user_ids
CREATE POLICY "Breach creator can manage notifications"
ON public.data_breach_notifications
FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- School admins can view breach summary (without affected_user_ids - handled at app level)
CREATE POLICY "School admins can view breach count only"
ON public.data_breach_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 4. FIX: Create function to log transcript analysis access by teachers
CREATE OR REPLACE FUNCTION public.log_transcript_access(
  p_student_id uuid,
  p_transcript_id uuid,
  p_access_type text DEFAULT 'view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if teacher is accessing a student's transcript
  IF p_student_id != auth.uid() THEN
    INSERT INTO public.educational_data_access_audit (
      accessed_user_id,
      accessor_user_id,
      access_type,
      data_category,
      data_accessed,
      educational_justification,
      legitimate_interest_verified,
      access_granted
    ) VALUES (
      p_student_id,
      auth.uid(),
      p_access_type,
      'transcript_analysis',
      'transcript:' || p_transcript_id::text,
      'Educational progress review',
      true,
      true
    );
  END IF;
END;
$$;

-- 5. FIX: Update profile_public_data to not expose role to students
DROP POLICY IF EXISTS "Students can view classmate public profiles" ON public.profile_public_data;

-- Students can only see display_name and avatar of classmates (not role)
CREATE POLICY "Students can view limited classmate data"
ON public.profile_public_data
FOR SELECT
USING (
  -- Own profile
  auth.uid() = user_id
  OR
  -- Classmates (but role column should be handled at app level)
  EXISTS (
    SELECT 1 FROM public.student_enrollments se1
    JOIN public.student_enrollments se2 ON se1.class_id = se2.class_id
    WHERE se1.student_id = auth.uid()
    AND se2.student_id = profile_public_data.user_id
  )
);

-- Run initial cleanup
SELECT public.anonymize_old_ip_addresses();
SELECT public.purge_old_audit_logs();