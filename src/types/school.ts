export interface School {
  id: string;
  name: string;
  district?: string;
  district_id?: string;
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
  teacher?: {
    id: string;
    display_name: string;
    email: string;
  };
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

export interface StudentUsageMetrics {
  id: string;
  student_id: string;
  class_id: string;
  practice_sessions: number;
  voice_chat_minutes: number;
  lessons_completed: number;
  last_activity_date?: string;
  week_starting: string;
  created_at: string;
  updated_at: string;
}

export interface ClassCertificationStats {
  id: string;
  class_id: string;
  certification_type: string;
  avg_score: number;
  student_count: number;
  last_updated: string;
  academic_year: string;
}

export interface SchoolCertificationStats {
  id: string;
  school_id: string;
  certification_type: string;
  avg_score: number;
  student_count: number;
  class_count: number;
  last_updated: string;
  academic_year: string;
}

export interface DistrictUser {
  id: string;
  user_id: string;
  district_id: string;
  role: string;
  consent_provided: boolean;
  consent_date: string | null;
  consent_type: string | null;
  created_at: string;
  updated_at: string;
  school_districts?: SchoolDistrict;
}

export type UserRole = 'student' | 'teacher' | 'admin' | 'district';

export interface ExtendedUserProfile {
  id: string;
  display_name: string | null;
  learning_goal: string | null;
  target_level: string | null;
  target_date: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role: string | null;
  email: string | null;
  student_id: string | null;
  school_id: string | null;
  graduation_year: number | null;
  grade_level_id: string | null;
  school: School | null;
  district_associations?: DistrictUser[];
}

export interface TeacherClassData {
  class_info: ClassInfo;
  enrollment_count: number;
  usage_stats: StudentUsageMetrics[];
  certification_stats: ClassCertificationStats[];
}

export interface AdminSchoolData {
  school: School;
  total_classes: number;
  total_teachers: number;
  total_students: number;
  avg_certification_score: number;
  certification_stats: SchoolCertificationStats[];
}

export interface DistrictSchoolData {
  school: School;
  avg_certification_score: number;
  total_students: number;
  total_classes: number;
  certification_stats: SchoolCertificationStats[];
}

export interface SchoolDistrict {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}
