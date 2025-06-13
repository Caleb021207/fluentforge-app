
import { supabase } from "@/integrations/supabase/client";
import { StudentEnrollment, StudentGrade, StudentUsageMetrics } from "@/types/school";

export const getStudentEnrollments = async (studentId: string): Promise<StudentEnrollment[]> => {
  try {
    console.log('Fetching enrollments for student:', studentId);
    
    const { data, error } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        class_info:classes (
          id,
          name,
          class_code,
          academic_year,
          period,
          room_number,
          subject:subjects (
            id,
            name,
            code,
            department
          ),
          teacher:profiles!classes_teacher_id_fkey (
            id,
            display_name,
            email
          )
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }

    console.log('Raw enrollment data:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getStudentEnrollments:', error);
    return [];
  }
};

export const getStudentGrades = async (studentId: string): Promise<StudentGrade[]> => {
  try {
    const { data, error } = await supabase
      .from('student_grades')
      .select(`
        *,
        assignment:assignments (
          id,
          title,
          assignment_type,
          points_possible,
          due_date
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getStudentGrades:', error);
    return [];
  }
};

export const getStudentUsageMetrics = async (studentId: string): Promise<StudentUsageMetrics[]> => {
  try {
    const { data, error } = await supabase
      .from('student_usage_metrics')
      .select('*')
      .eq('student_id', studentId)
      .order('week_starting', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching usage metrics:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getStudentUsageMetrics:', error);
    return [];
  }
};
