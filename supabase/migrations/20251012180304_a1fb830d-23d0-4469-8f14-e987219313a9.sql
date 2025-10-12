-- Phase 1: Fix RLS policy on usage_tracking to allow all authenticated users
DROP POLICY IF EXISTS "Students can insert their own usage tracking" ON usage_tracking;
DROP POLICY IF EXISTS "Users can insert their own usage tracking" ON usage_tracking;

CREATE POLICY "Users can insert their own usage tracking"
ON usage_tracking
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Ensure the policy for viewing own records exists
DROP POLICY IF EXISTS "Users can view their own usage tracking" ON usage_tracking;

CREATE POLICY "Users can view their own usage tracking"
ON usage_tracking
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);