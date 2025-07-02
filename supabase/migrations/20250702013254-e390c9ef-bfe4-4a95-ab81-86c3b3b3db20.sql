-- FINAL COMPREHENSIVE CLEANUP: Remove ALL existing policies and start fresh

-- Drop ALL policies on all tables that might conflict
-- profiles table
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
DROP POLICY IF EXISTS "Users own profile access" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles temporarily" ON public.profiles;

-- classes table
DROP POLICY IF EXISTS "Users can view classes in their school v2" ON public.classes;
DROP POLICY IF EXISTS "Users can view their classes" ON public.classes;

-- student_enrollments table
DROP POLICY IF EXISTS "Admins can view student enrollments in their school v2" ON public.student_enrollments;
DROP POLICY IF EXISTS "Users can view their enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Teachers can view their class enrollments" ON public.student_enrollments;

-- transcript_analyses table
DROP POLICY IF EXISTS "Admins can view student transcript analyses via class enrollmen" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Users can view their own transcript analyses" ON public.transcript_analyses;

-- student_language_metrics table
DROP POLICY IF EXISTS "Admins can view student language metrics via class enrollment" ON public.student_language_metrics;
DROP POLICY IF EXISTS "Users can view their own language metrics" ON public.student_language_metrics;

-- student_metrics table
DROP POLICY IF EXISTS "Admins can view student metrics via class enrollment" ON public.student_metrics;
DROP POLICY IF EXISTS "Users can view their own metrics" ON public.student_metrics;

-- Drop the problematic functions with CASCADE
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_school_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

-- Create simple, working policies
-- profiles table - basic access only
CREATE POLICY "Users manage own profile" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid());

-- Allow reading profiles for now (we'll make this more restrictive later)
CREATE POLICY "Authenticated read profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);