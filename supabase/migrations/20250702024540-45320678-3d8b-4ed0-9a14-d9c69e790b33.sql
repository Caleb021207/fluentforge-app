-- Corrected full platform reset for testing new role/code system

-- First, preserve the current user's district associations
-- (We'll delete all others but keep the current user's)

-- Clear all access codes
DELETE FROM public.access_codes;

-- Clear all student enrollments first (to avoid FK conflicts)
DELETE FROM public.student_enrollments;

-- Clear all classroom memberships
DELETE FROM public.classroom_memberships;

-- Clear all student metrics
DELETE FROM public.student_metrics;

-- Clear all student language metrics  
DELETE FROM public.student_language_metrics;

-- Clear certification attempts
DELETE FROM public.certification_attempts;

-- Clear study recommendations
DELETE FROM public.study_recommendations;

-- Clear progress milestones
DELETE FROM public.progress_milestones;

-- Clear classroom codes
DELETE FROM public.classroom_codes;

-- Clear assignments and grades
DELETE FROM public.student_grades;
DELETE FROM public.assignments;

-- Clear teacher assignments
DELETE FROM public.teacher_assignments;

-- Clear classes (this was missing in the original reset!)
DELETE FROM public.classes;

-- Clear district user assignments EXCEPT for the current admin
DELETE FROM public.district_users 
WHERE user_id != '5d15aec9-7c4e-44cc-a4e6-1a50b8d0a08e'::uuid;

-- Reset all user profiles to student role EXCEPT the current admin
UPDATE public.profiles 
SET role = 'student', 
    school_id = NULL,
    student_id = NULL,
    graduation_year = NULL,
    grade_level_id = NULL
WHERE id != '5d15aec9-7c4e-44cc-a4e6-1a50b8d0a08e'::uuid;

-- Clear schools that are NOT associated with the current admin's district
-- (Keep schools in the admin's district but remove orphaned ones)
DELETE FROM public.schools 
WHERE district_id NOT IN (
  SELECT district_id 
  FROM public.district_users 
  WHERE user_id = '5d15aec9-7c4e-44cc-a4e6-1a50b8d0a08e'::uuid
);

-- Clear any certification stats
DELETE FROM public.class_certification_stats;
DELETE FROM public.school_certification_stats;

-- Clear usage metrics
DELETE FROM public.student_usage_metrics;