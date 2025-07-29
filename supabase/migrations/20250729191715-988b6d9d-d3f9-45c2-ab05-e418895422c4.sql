-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.log_role_change_attempt(
  target_user_id UUID,
  requested_role TEXT,
  success BOOLEAN
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, 
    action, 
    details, 
    success
  ) VALUES (
    auth.uid(),
    'role_change_attempt',
    json_build_object(
      'target_user_id', target_user_id,
      'requested_role', requested_role,
      'requester_role', (SELECT role FROM public.profiles WHERE id = auth.uid())
    ),
    success
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';