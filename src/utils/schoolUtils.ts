
import { supabase } from "@/integrations/supabase/client";
import { StudentEnrollment, StudentGrade, StudentUsageMetrics, ExtendedUserProfile, AdminSchoolData, TeacherClassData, DistrictSchoolData } from "@/types/school";

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
    // Cast the data to match our interface, ensuring status is properly typed
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'active' | 'dropped' | 'completed'
    })) as StudentEnrollment[];
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
          due_date,
          class_id,
          created_at,
          updated_at
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

export const getExtendedUserProfile = async (userId: string): Promise<ExtendedUserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        school:schools (
          id,
          name,
          district,
          address,
          phone,
          email,
          principal_name
        ),
        grade_level:grade_levels (
          id,
          level_name,
          level_number
        )
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

export const getAdminSchoolData = async (userId: string): Promise<AdminSchoolData | null> => {
  try {
    // First get the admin's school
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', userId)
      .single();

    if (!profile?.school_id) return null;

    // Get school info
    const { data: school } = await supabase
      .from('schools')
      .select('*')
      .eq('id', profile.school_id)
      .single();

    if (!school) return null;

    // Get school stats
    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('school_id', profile.school_id);

    const { data: teachers } = await supabase
      .from('profiles')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('role', 'teacher');

    const { data: certStats } = await supabase
      .from('school_certification_stats')
      .select('*')
      .eq('school_id', profile.school_id);

    return {
      school,
      total_classes: classes?.length || 0,
      total_teachers: teachers?.length || 0,
      total_students: 0, // Would need to calculate from enrollments
      certification_stats: certStats || []
    };
  } catch (error) {
    console.error('Error in getAdminSchoolData:', error);
    return null;
  }
};

export const getSchoolClassroomData = async (userId: string): Promise<TeacherClassData[]> => {
  try {
    // Get admin's school
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', userId)
      .single();

    if (!profile?.school_id) return [];

    // Get classes in the school
    const { data: classes } = await supabase
      .from('classes')
      .select(`
        *,
        subject:subjects (*),
        teacher:profiles!classes_teacher_id_fkey (
          id,
          display_name,
          email
        )
      `)
      .eq('school_id', profile.school_id);

    if (!classes) return [];

    // Get enrollment counts and stats for each class
    const classData: TeacherClassData[] = [];
    
    for (const classInfo of classes) {
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('class_id', classInfo.id)
        .eq('status', 'active');

      const { data: certStats } = await supabase
        .from('class_certification_stats')
        .select('*')
        .eq('class_id', classInfo.id);

      classData.push({
        class_info: classInfo,
        enrollment_count: enrollments?.length || 0,
        usage_stats: [], // Would need to implement if needed
        certification_stats: certStats || []
      });
    }

    return classData;
  } catch (error) {
    console.error('Error in getSchoolClassroomData:', error);
    return [];
  }
};

export const getDistrictSchoolsData = async (userId: string): Promise<DistrictSchoolData[]> => {
  try {
    // Get district schools - for now, get all schools
    // In a real implementation, you'd filter by district_id
    const { data: schools } = await supabase
      .from('schools')
      .select('*');

    if (!schools) return [];

    const districtData: DistrictSchoolData[] = [];

    for (const school of schools) {
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', school.id);

      const { data: certStats } = await supabase
        .from('school_certification_stats')
        .select('*')
        .eq('school_id', school.id);

      const avgScore = certStats?.length ? 
        certStats.reduce((sum, stat) => sum + (stat.avg_score || 0), 0) / certStats.length : 0;

      districtData.push({
        school,
        avg_certification_score: avgScore,
        total_students: 0, // Would need to calculate from enrollments
        total_classes: classes?.length || 0,
        certification_stats: certStats || []
      });
    }

    return districtData;
  } catch (error) {
    console.error('Error in getDistrictSchoolsData:', error);
    return [];
  }
};
