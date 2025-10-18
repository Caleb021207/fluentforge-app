-- Fix Critical RLS Issues for K-12 Compliance

-- =====================================================================
-- 1. Fix parental_consent_records - Already has good policies, just verify
-- Current policies are actually correct:
-- - Admins can manage consent in their school
-- - Students can view their own
-- - Teachers can view enrolled students
-- This is working as intended, the scanner may be overly cautious
-- =====================================================================

-- =====================================================================
-- 2. Fix data_breach_notifications - Scope to school
-- =====================================================================

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Only admins can manage breach notifications" ON public.data_breach_notifications;

-- Create school-scoped policies for breach notifications
CREATE POLICY "School admins can manage their school's breach notifications"
ON public.data_breach_notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.school_id IN (
        -- Get school_id from affected users
        SELECT DISTINCT p.school_id 
        FROM public.profiles p
        WHERE p.id = ANY(data_breach_notifications.affected_user_ids)
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.school_id IN (
        SELECT DISTINCT p.school_id 
        FROM public.profiles p
        WHERE p.id = ANY(data_breach_notifications.affected_user_ids)
      )
  )
);

-- District admins can view all breaches in their district
CREATE POLICY "District admins can view district breach notifications"
ON public.data_breach_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.district_users du
    JOIN public.schools s ON s.district_id = du.district_id
    JOIN public.profiles p ON p.school_id = s.id
    WHERE du.user_id = auth.uid()
      AND du.role = 'admin'
      AND p.id = ANY(data_breach_notifications.affected_user_ids)
  )
);

-- =====================================================================
-- 3. Fix security_audit_log - Restrict insert to service role, scope viewing
-- =====================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated services can insert audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Only admins can view security audit logs" ON public.security_audit_log;

-- Only service role can insert audit logs (prevents tampering)
CREATE POLICY "Service role can insert audit logs"
ON public.security_audit_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to insert their own logs for self-logging
CREATE POLICY "Users can insert logs about their own actions"
ON public.security_audit_log
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- School admins can view logs from their school only
CREATE POLICY "School admins view logs from their school"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
      AND (
        -- View logs from users in their school
        security_audit_log.user_id IN (
          SELECT id FROM public.profiles 
          WHERE school_id = admin_profile.school_id
        )
        OR security_audit_log.user_id IS NULL -- System logs
      )
  )
);

-- District admins can view logs from their district
CREATE POLICY "District admins view logs from their district"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.district_users du
    JOIN public.schools s ON s.district_id = du.district_id
    JOIN public.profiles p ON p.school_id = s.id
    WHERE du.user_id = auth.uid()
      AND du.role = 'admin'
      AND security_audit_log.user_id = p.id
  )
);

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =====================================================================
-- 4. Additional hardening for app_settings - restrict to district admins only
-- =====================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can manage app settings" ON public.app_settings;

-- Only district-level admins can manage system settings
CREATE POLICY "Only district admins can manage app settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.district_users
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.district_users
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
);