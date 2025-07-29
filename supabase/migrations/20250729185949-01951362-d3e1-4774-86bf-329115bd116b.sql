-- CRITICAL SECURITY FIX: Remove dangerous role-changing function
DROP FUNCTION IF EXISTS public.change_user_role_for_testing(text);

-- Add security audit for role changes
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Strengthen RLS policy for profiles - restrict role changes
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile (except role)" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND 
  -- Prevent users from changing their own role
  (role IS NULL OR role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Only admins can change roles
CREATE POLICY "Admins can manage roles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);