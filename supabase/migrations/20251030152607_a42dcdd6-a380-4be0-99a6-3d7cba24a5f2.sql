-- Fix class_members RLS infinite recursion by creating security definer function
-- This follows the same pattern as has_role() function

CREATE OR REPLACE FUNCTION public.is_class_member(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members
    WHERE user_id = _user_id AND class_id = _class_id
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view class members in their classes" ON public.class_members;

-- Create non-recursive policy using the security definer function
CREATE POLICY "Users can view class members in their classes"
ON public.class_members FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM classes c 
    WHERE c.id = class_members.class_id 
    AND c.teacher_id = auth.uid()
  )
  OR public.is_class_member(auth.uid(), class_members.class_id)
);

-- Add missing RLS policies for email_captures table
CREATE POLICY "Admins can view email captures"
ON public.email_captures FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update email captures"
ON public.email_captures FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete email captures"
ON public.email_captures FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));