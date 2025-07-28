-- Fix remaining database functions missing search_path
CREATE OR REPLACE FUNCTION public.auth_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_student_in_admin_school(student_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  admin_school_id UUID;
  student_in_school BOOLEAN := FALSE;
BEGIN
  -- Get admin's school
  SELECT school_id INTO admin_school_id 
  FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin';
  
  IF admin_school_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if student is enrolled in any class in admin's school
  SELECT EXISTS (
    SELECT 1 
    FROM public.student_enrollments se
    JOIN public.classes c ON c.id = se.class_id
    WHERE se.student_id = student_user_id 
    AND c.school_id = admin_school_id
  ) INTO student_in_school;
  
  RETURN student_in_school;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_district_ids(target_user_id uuid)
 RETURNS uuid[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN ARRAY(
    SELECT district_id 
    FROM public.district_users 
    WHERE user_id = target_user_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_teacher_of_class(class_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = class_id_param AND teacher_id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_user_enrolled_in_class(class_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
    is_enrolled boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.student_enrollments 
        WHERE student_id = auth.uid() AND class_id = class_id_param
    ) INTO is_enrolled;

    RETURN is_enrolled;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_certification_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.process_access_code()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    -- Set the search path at the beginning of the function
    EXECUTE 'SET search_path = public';

    -- Function logic here
END;
$function$;