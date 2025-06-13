
import { supabase } from "@/integrations/supabase/client";
import { ExtendedUserProfile, StudentEnrollment, ClassInfo, StudentGrade, Assignment } from "@/types/school";

export const getExtendedUserProfile = async (userId: string): Promise<ExtendedUserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        school:schools(*),
        grade_level:grade_levels(*)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching extended profile:', error);
      return null;
    }

    return data as ExtendedUserProfile;
  } catch (error) {
    console.error('Error in getExtendedUserProfile:', error);
    return null;
  }
};

export const getStudentEnrollments = async (studentId: string): Promise<StudentEnrollment[]> => {
  try {
    const { data, error } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        class_info:classes(
          *,
          subject:subjects(*),
          grade_level:grade_levels(*)
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching student enrollments:', error);
      return [];
    }

    return data as StudentEnrollment[];
  } catch (error) {
    console.error('Error in getStudentEnrollments:', error);
    return [];
  }
};

export const getTeacherClasses = async (teacherId: string): Promise<ClassInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        subject:subjects(*),
        grade_level:grade_levels(*)
      `)
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Error fetching teacher classes:', error);
      return [];
    }

    return data as ClassInfo[];
  } catch (error) {
    console.error('Error in getTeacherClasses:', error);
    return [];
  }
};

export const getStudentGrades = async (studentId: string): Promise<StudentGrade[]> => {
  try {
    const { data, error } = await supabase
      .from('student_grades')
      .select(`
        *,
        assignment:assignments(*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching student grades:', error);
      return [];
    }

    return data as StudentGrade[];
  } catch (error) {
    console.error('Error in getStudentGrades:', error);
    return [];
  }
};

export const calculateGPA = (grades: StudentGrade[]): number => {
  const gradePoints: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };

  const validGrades = grades.filter(g => g.grade_letter && gradePoints[g.grade_letter] !== undefined);
  if (validGrades.length === 0) return 0;

  const totalPoints = validGrades.reduce((sum, grade) => {
    return sum + (gradePoints[grade.grade_letter!] || 0);
  }, 0);

  return totalPoints / validGrades.length;
};
