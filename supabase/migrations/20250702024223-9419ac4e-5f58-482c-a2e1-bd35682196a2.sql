-- Full platform reset for testing new role/code system

-- Clear all access codes
DELETE FROM public.access_codes;

-- Clear all district user assignments
DELETE FROM public.district_users;

-- Clear all student enrollments
DELETE FROM public.student_enrollments;

-- Clear all classroom memberships
DELETE FROM public.classroom_memberships;

-- Clear all student metrics
DELETE FROM public.student_metrics;

-- Clear all student language metrics
DELETE FROM public.student_language_metrics;

-- Reset all user roles to student (except keep your district role)
UPDATE public.profiles 
SET role = 'student', 
    school_id = NULL 
WHERE id != '5d15aec9-7c4e-44cc-a4e6-1a50b8d0a08e'::uuid;

-- Clear classroom codes
DELETE FROM public.classroom_codes;

-- Reset certification attempts
DELETE FROM public.certification_attempts;

-- Clear study recommendations
DELETE FROM public.study_recommendations;

-- Clear progress milestones
DELETE FROM public.progress_milestones;