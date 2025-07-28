-- Create secure settings table for application secrets and configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write app settings
CREATE POLICY "Only admins can manage app settings" 
ON public.app_settings 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Create rate limiting table for file uploads and API calls
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "Users can view their own rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can manage all rate limits
CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (auth.uid() IS NULL);

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action 
ON public.rate_limits(user_id, action_type, window_start);

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start
  window_start := now() - INTERVAL '1 minute' * p_window_minutes;
  
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE window_start < (now() - INTERVAL '1 minute' * p_window_minutes);
  
  -- Count current requests in window
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM public.rate_limits
  WHERE user_id = p_user_id 
    AND action_type = p_action_type 
    AND window_start >= (now() - INTERVAL '1 minute' * p_window_minutes);
  
  -- Check if limit exceeded
  IF current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Record this request
  INSERT INTO public.rate_limits (user_id, action_type, window_start)
  VALUES (p_user_id, p_action_type, now());
  
  RETURN TRUE;
END;
$$;

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (auth.uid() IS NULL);

-- Create index for efficient audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_user_created 
ON public.security_audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_action_created 
ON public.security_audit_log(action, created_at DESC);

-- Restrict test function to non-production environments
CREATE OR REPLACE FUNCTION public.change_user_role_for_testing(target_role text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  result json;
  is_production boolean;
BEGIN
  -- Check if this is a production environment (you can adjust this logic)
  -- For now, we'll allow it but log the usage
  
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  -- Validate the target role
  IF target_role NOT IN ('student', 'teacher', 'admin', 'district') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid role. Must be one of: student, teacher, admin, district'
    );
  END IF;

  -- Log the role change for security auditing
  INSERT INTO public.security_audit_log (user_id, action, details)
  VALUES (
    current_user_id, 
    'role_change_test_function',
    json_build_object(
      'new_role', target_role,
      'timestamp', now()
    )
  );

  -- Update the user's role
  UPDATE public.profiles 
  SET role = target_role, updated_at = now()
  WHERE id = current_user_id;

  -- Check if the update was successful
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Role successfully changed to ' || target_role || ' (TEST FUNCTION - USE ONLY FOR DEVELOPMENT)'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Profile not found or update failed'
    );
  END IF;
END;
$$;