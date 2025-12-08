-- Drop the problematic "Restricted profile viewing" policy that causes infinite recursion
-- This policy has inline SQL that queries profiles directly within a profiles policy
-- The other existing policies already cover all the same use cases with security definer functions
DROP POLICY IF EXISTS "Restricted profile viewing" ON public.profiles;