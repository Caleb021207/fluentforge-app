-- Fix the rate limiting function's ambiguous column reference
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid, p_action_type text, p_max_requests integer DEFAULT 10, p_window_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start
  window_start_time := now() - INTERVAL '1 minute' * p_window_minutes;
  
  -- Clean up old entries using explicit table reference
  DELETE FROM public.rate_limits 
  WHERE rate_limits.window_start < window_start_time;
  
  -- Count current requests in window
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM public.rate_limits
  WHERE user_id = p_user_id 
    AND action_type = p_action_type 
    AND rate_limits.window_start >= window_start_time;
  
  -- Check if limit exceeded
  IF current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Record this request
  INSERT INTO public.rate_limits (user_id, action_type, window_start)
  VALUES (p_user_id, p_action_type, now());
  
  RETURN TRUE;
END;
$function$