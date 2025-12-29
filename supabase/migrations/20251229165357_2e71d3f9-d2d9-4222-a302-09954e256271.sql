-- Drop the old function with the wrong signature (it references non-existent classroom_memberships)
DROP FUNCTION IF EXISTS public.get_class_student_metrics(uuid);

-- Recreate with correct signature using student_enrollments
CREATE OR REPLACE FUNCTION public.get_class_student_metrics(target_class_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(student_id uuid, class_id uuid, student_name text, student_email text, text_practice_calls integer, premium_voice_calls integer, last_activity timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is authorized to view student metrics
  IF NOT (
    -- User is a teacher of this class
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE (target_class_id IS NULL OR c.id = target_class_id)
      AND c.teacher_id = auth.uid()
    )
    OR
    -- User is a school admin
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- User is a district admin
    EXISTS (
      SELECT 1 FROM district_users WHERE user_id = auth.uid() AND role = 'admin'
    )
  ) THEN
    RETURN; -- Return empty result if not authorized
  END IF;

  -- Return filtered data based on user permissions using student_enrollments
  RETURN QUERY
  SELECT 
    sm.student_id,
    se.class_id,
    CASE 
      -- Only show student names to authorized personnel
      WHEN EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')
      ) THEN p.display_name
      -- Students can only see their own name
      WHEN sm.student_id = auth.uid() THEN p.display_name
      ELSE '[REDACTED]'
    END::text AS student_name,
    CASE 
      -- Only show emails to authorized personnel  
      WHEN EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')
      ) THEN p.email
      -- Students cannot see emails
      ELSE '[REDACTED]'
    END::text AS student_email,
    sm.text_practice_calls,
    sm.premium_voice_calls,
    sm.last_activity
  FROM student_metrics sm
  JOIN student_enrollments se ON sm.student_id = se.student_id
  LEFT JOIN profiles p ON sm.student_id = p.id
  WHERE target_class_id IS NULL OR se.class_id = target_class_id;
END;
$function$;