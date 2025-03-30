
import { User } from '@supabase/supabase-js';
import { Classroom, StudentClassroom, UserRole, UsageStats } from '@/types/supabase';

export interface ClassroomContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole) => Promise<void>;
  userClassrooms: Classroom[];
  enrolledClassrooms: {classroom: Classroom, enrollment: StudentClassroom}[];
  usageStats: UsageStats | null;
  isLoading: boolean;
  createClassroom: (name: string) => Promise<Classroom | null>;
  joinClassroom: (classCode: string) => Promise<boolean>;
  leaveClassroom: (classroomId: string) => Promise<boolean>;
  deleteClassroom: (classroomId: string) => Promise<boolean>;
  resetClassCode: (classroomId: string) => Promise<string | null>;
  fetchStudentsInClassroom: (classroomId: string) => Promise<any[]>;
  fetchStudentStats: (studentId: string) => Promise<UsageStats | null>;
  isTeacher: boolean;
  isStudent: boolean;
  hasClassroom: boolean;
}

export interface ClassroomProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export interface StudentProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  joined_at: string;
  text_chat_count: number;
  voice_minutes_used: number;
}
