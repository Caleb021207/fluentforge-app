
-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments in their classes" ON public.student_enrollments;
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Users can view their enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Users can insert their enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Teachers can view their class enrollments" ON public.student_enrollments;

DROP POLICY IF EXISTS "Teachers can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Students can view classes they are enrolled in" ON public.classes;
DROP POLICY IF EXISTS "Admins can view all classes in their school" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view their classes" ON public.classes;
DROP POLICY IF EXISTS "Students can view their enrolled classes" ON public.classes;
DROP POLICY IF EXISTS "Admins can view all classes" ON public.classes;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view profiles of students in their classes" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their school" ON public.profiles;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_user_enrolled_in_class(class_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_enrollments 
    WHERE student_id = auth.uid() AND class_id = class_id_param
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_teacher_of_class(class_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = class_id_param AND teacher_id = auth.uid()
  );
$$;

-- Enable RLS on tables
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies using security definer functions
-- Policies for student_enrollments table
CREATE POLICY "Users can view their own enrollments" 
ON public.student_enrollments 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view enrollments in their classes" 
ON public.student_enrollments 
FOR SELECT 
USING (public.is_user_teacher_of_class(class_id));

CREATE POLICY "Users can insert their own enrollments" 
ON public.student_enrollments 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

-- Policies for classes table
CREATE POLICY "Teachers can view their own classes" 
ON public.classes 
FOR SELECT 
USING (teacher_id = auth.uid());

CREATE POLICY "Students can view classes they are enrolled in" 
ON public.classes 
FOR SELECT 
USING (public.is_user_enrolled_in_class(id));

CREATE POLICY "Admins can view all classes in their school" 
ON public.classes 
FOR SELECT 
USING (
  public.get_user_role() = 'admin' AND 
  school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())
);

-- Policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Teachers can view profiles of students in their classes" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_user_role() = 'teacher' AND 
  id IN (
    SELECT se.student_id 
    FROM public.student_enrollments se 
    JOIN public.classes c ON c.id = se.class_id 
    WHERE c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Admins can view profiles in their school" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_user_role() = 'admin' AND 
  school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())
);
