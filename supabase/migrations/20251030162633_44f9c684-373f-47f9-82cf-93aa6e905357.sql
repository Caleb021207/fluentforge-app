-- Fix search_path security warning for can_send_text_message function
DROP FUNCTION IF EXISTS public.can_send_text_message(UUID);

CREATE OR REPLACE FUNCTION public.can_send_text_message(p_student_id UUID)
RETURNS TABLE (
  can_send BOOLEAN,
  messages_used INTEGER,
  messages_limit INTEGER,
  messages_remaining INTEGER,
  reason TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limits RECORD;
  v_current_month DATE;
BEGIN
  v_current_month := DATE_TRUNC('month', NOW());
  
  -- Get or create student limits
  SELECT 
    text_messages_monthly_limit,
    text_messages_used_current_month,
    current_month
  INTO v_limits
  FROM public.student_usage_limits
  WHERE student_id = p_student_id
    AND academic_year = EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT;
  
  -- If no record exists, create one with defaults
  IF NOT FOUND THEN
    INSERT INTO public.student_usage_limits (
      student_id,
      academic_year,
      text_messages_monthly_limit,
      text_messages_used_current_month
    ) VALUES (
      p_student_id,
      EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT,
      1500,
      0
    )
    RETURNING text_messages_monthly_limit, text_messages_used_current_month, current_month
    INTO v_limits;
  END IF;
  
  -- Reset monthly counters if month has changed
  IF v_limits.current_month < v_current_month THEN
    UPDATE public.student_usage_limits
    SET 
      text_messages_used_current_month = 0,
      current_month = v_current_month,
      last_reset_month = NOW()
    WHERE student_id = p_student_id
      AND academic_year = EXTRACT(YEAR FROM NOW())::TEXT || '-' || (EXTRACT(YEAR FROM NOW()) + 1)::TEXT;
    
    v_limits.text_messages_used_current_month := 0;
  END IF;
  
  -- Check if limit is reached
  IF v_limits.text_messages_used_current_month >= v_limits.text_messages_monthly_limit THEN
    RETURN QUERY SELECT 
      false,
      v_limits.text_messages_used_current_month,
      v_limits.text_messages_monthly_limit,
      0,
      'Monthly text message limit reached'::TEXT;
  ELSE
    RETURN QUERY SELECT 
      true,
      v_limits.text_messages_used_current_month,
      v_limits.text_messages_monthly_limit,
      v_limits.text_messages_monthly_limit - v_limits.text_messages_used_current_month,
      'OK'::TEXT;
  END IF;
END;
$$;