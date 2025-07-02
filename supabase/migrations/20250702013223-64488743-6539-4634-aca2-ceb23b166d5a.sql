-- COMPREHENSIVE CLEANUP: Fix all recursive RLS policies across all tables

-- First, drop ALL policies that depend on the problematic functions
DROP POLICY IF EXISTS "Users can view classes in their school v2" ON public.classes;
DROP POLICY IF EXISTS "Admins can view student enrollments in their school v2" ON public.student_enrollments;
DROP POLICY IF EXISTS "Admins can view student transcript analyses via class enrollmen" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Admins can view student language metrics via class enrollment" ON public.student_language_metrics;
DROP POLICY IF EXISTS "Admins can view student metrics via class enrollment" ON public.student_metrics;

-- Drop ALL existing policies on profiles table 
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "District admins can view profiles in their district" ON public.profiles;
DROP POLICY IF EXISTS "School admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view student profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Basic user access to own profile" ON public.profiles;
DROP POLICY IF EXISTS "District admin profile access" ON public.profiles;
DROP POLICY IF EXISTS "School admin profile access" ON public.profiles;
DROP POLICY IF EXISTS "Teacher student profile access" ON public.profiles;

-- Now drop the problematic functions
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_school_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

-- Create SIMPLE, NON-RECURSIVE policies for profiles table
CREATE POLICY "Users own profile access" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid());

-- Temporarily allow authenticated users to view all profiles while we fix the system
CREATE POLICY "Authenticated users can view profiles temporarily" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Recreate essential policies for other tables without recursive functions
CREATE POLICY "Users can view their enrollments" 
ON public.student_enrollments 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view their class enrollments" 
ON public.student_enrollments 
FOR SELECT 
USING (is_user_teacher_of_class(class_id));

CREATE POLICY "Users can view their classes" 
ON public.classes 
FOR SELECT 
USING (
  teacher_id = auth.uid() OR 
  is_user_enrolled_in_class(id)
);

CREATE POLICY "Users can view their own language metrics" 
ON public.student_language_metrics 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own metrics" 
ON public.student_metrics 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Users can view their own transcript analyses" 
ON public.transcript_analyses 
FOR SELECT 
USING (user_id = auth.uid());