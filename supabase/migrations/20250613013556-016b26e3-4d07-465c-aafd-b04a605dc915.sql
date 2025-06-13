
-- Create school information table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  principal_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create grade levels table
CREATE TABLE public.grade_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_name TEXT NOT NULL, -- e.g., "9th Grade", "10th Grade", "Freshman", "Sophomore"
  level_number INTEGER NOT NULL, -- 9, 10, 11, 12
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "English", "Math", "Spanish", "French"
  code TEXT, -- e.g., "ENG", "MATH", "SPA"
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update profiles table to include school information
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade_level_id UUID REFERENCES public.grade_levels(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id TEXT; -- School's internal student ID
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- Create teacher assignments table
CREATE TABLE public.teacher_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL, -- e.g., "2023-2024"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, subject_id, school_id, academic_year)
);

-- Create classes table (specific class instances)
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "English 9A", "AP Spanish Literature"
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  grade_level_id UUID REFERENCES public.grade_levels(id),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  class_code TEXT NOT NULL, -- e.g., "ENG9A-2024"
  period TEXT, -- e.g., "1st Period", "Period 3"
  room_number TEXT,
  academic_year TEXT NOT NULL,
  semester TEXT, -- e.g., "Fall", "Spring", "Full Year"
  max_students INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_code, school_id, academic_year)
);

-- Create student enrollments table
CREATE TABLE public.student_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  final_grade TEXT, -- e.g., "A+", "B-", "Pass"
  grade_points NUMERIC, -- GPA points for this class
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT, -- e.g., "homework", "quiz", "test", "project"
  due_date TIMESTAMP WITH TIME ZONE,
  points_possible NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student grades table
CREATE TABLE public.student_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  points_earned NUMERIC,
  grade_letter TEXT, -- e.g., "A", "B+", "C-"
  submitted_at TIMESTAMP WITH TIME ZONE,
  graded_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, assignment_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for schools (readable by all authenticated users in the school)
CREATE POLICY "Users can view their school" ON public.schools FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE school_id = schools.id
  )
);

-- Create RLS policies for grade levels
CREATE POLICY "Users can view grade levels in their school" ON public.grade_levels FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND school_id = grade_levels.school_id
  )
);

-- Create RLS policies for subjects (readable by all authenticated users)
CREATE POLICY "Authenticated users can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);

-- Create RLS policies for teacher assignments
CREATE POLICY "Teachers can view their assignments" ON public.teacher_assignments FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can manage their assignments" ON public.teacher_assignments FOR ALL USING (teacher_id = auth.uid());

-- Create RLS policies for classes
CREATE POLICY "Users can view classes in their school" ON public.classes FOR SELECT USING (
  -- Teachers can see their classes
  teacher_id = auth.uid() OR
  -- Students can see classes they're enrolled in
  EXISTS (
    SELECT 1 FROM public.student_enrollments 
    WHERE student_id = auth.uid() AND class_id = classes.id
  ) OR
  -- Admins can see all classes in their school
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND school_id = classes.school_id AND role = 'admin'
  )
);

CREATE POLICY "Teachers can manage their classes" ON public.classes FOR ALL USING (teacher_id = auth.uid());

-- Create RLS policies for student enrollments
CREATE POLICY "Students can view their enrollments" ON public.student_enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers can view enrollments in their classes" ON public.student_enrollments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = student_enrollments.class_id AND teacher_id = auth.uid()
  )
);

-- Create RLS policies for assignments
CREATE POLICY "Students can view assignments in their classes" ON public.assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments 
    WHERE student_id = auth.uid() AND class_id = assignments.class_id
  )
);
CREATE POLICY "Teachers can manage assignments in their classes" ON public.assignments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = assignments.class_id AND teacher_id = auth.uid()
  )
);

-- Create RLS policies for student grades
CREATE POLICY "Students can view their own grades" ON public.student_grades FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers can manage grades for their classes" ON public.student_grades FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.classes c ON c.id = a.class_id
    WHERE a.id = student_grades.assignment_id AND c.teacher_id = auth.uid()
  )
);

-- Insert some default subjects
INSERT INTO public.subjects (name, code, department) VALUES
('English Language Arts', 'ELA', 'English'),
('Mathematics', 'MATH', 'Mathematics'),
('Spanish', 'SPA', 'World Languages'),
('French', 'FRE', 'World Languages'),
('German', 'GER', 'World Languages'),
('Science', 'SCI', 'Science'),
('Social Studies', 'SS', 'Social Studies'),
('Physical Education', 'PE', 'Physical Education'),
('Art', 'ART', 'Fine Arts'),
('Music', 'MUS', 'Fine Arts');
