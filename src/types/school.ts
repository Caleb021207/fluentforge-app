
export interface School {
  id: string;
  name: string;
  district?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  created_at: string;
  updated_at: string;
}

export interface GradeLevel {
  id: string;
  level_name: string;
  level_number: number;
  school_id?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  department?: string;
  created_at: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  subject_id: string;
  teacher_id: string;
  grade_level_id?: string;
  school_id: string;
  class_code: string;
  period?: string;
  room_number?: string;
  academic_year: string;
  semester?: string;
  max_students: number;
  created_at: string;
  updated_at: string;
  // Joined data
  subject?: Subject;
  grade_level?: GradeLevel;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  enrollment_date: string;
  status: 'active' | 'dropped' | 'completed';
  final_grade?: string;
  grade_points?: number;
  created_at: string;
  updated_at: string;
  // Joined data
  class_info?: ClassInfo;
}

export interface Assignment {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  assignment_type?: string;
  due_date?: string;
  points_possible: number;
  created_at: string;
  updated_at: string;
}

export interface StudentGrade {
  id: string;
  student_id: string;
  assignment_id: string;
  points_earned?: number;
  grade_letter?: string;
  submitted_at?: string;
  graded_at?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assignment?: Assignment;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface ExtendedUserProfile {
  id: string;
  display_name: string | null;
  learning_goal: string | null;
  target_level: string | null;
  target_date: string | null;
  avatar_url: string | null;
  email: string | null;
  school_id: string | null;
  grade_level_id: string | null;
  student_id: string | null;
  role: UserRole;
  graduation_year: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  school?: School;
  grade_level?: GradeLevel;
}
