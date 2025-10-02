-- Drop existing policies on rate_limits
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Create hierarchical access policies for rate_limits

-- Users can view their own rate limits
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Teachers can view rate limits for students in their classes
CREATE POLICY "Teachers can view student rate limits in their classes"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM student_enrollments se
    JOIN classes c ON c.id = se.class_id
    WHERE se.student_id = rate_limits.user_id
    AND c.teacher_id = auth.uid()
  )
);

-- School admins can view rate limits for users in their school
CREATE POLICY "Admins can view rate limits in their school"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles admin_profile,
         profiles user_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
    AND user_profile.id = rate_limits.user_id
    AND user_profile.school_id = admin_profile.school_id
  )
);

-- District admins can view all rate limits in their district
CREATE POLICY "District admins can view rate limits in their district"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM district_users du
    JOIN schools s ON s.district_id = du.district_id
    JOIN profiles sp ON sp.school_id = s.id
    WHERE du.user_id = auth.uid()
    AND sp.id = rate_limits.user_id
  )
);

-- Service role can still manage rate limits (for system operations)
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);