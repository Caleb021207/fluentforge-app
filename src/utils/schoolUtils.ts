
import { supabase } from "@/integrations/supabase/client";
import { ExtendedUserProfile, AdminSchoolData, DistrictSchoolData, StudentEnrollment, StudentGrade, StudentUsageMetrics, TeacherClassData } from "@/types/school";

/**
 * Get extended user profile with school and district information
 */
export const getExtendedUserProfile = async (userId: string): Promise<ExtendedUserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        school:schools(
          id,
          name,
          district,
          district_id,
          address,
          phone,
          email,
          principal_name,
          created_at,
          updated_at
        ),
        district_user:district_users(
          district_id,
          role,
          district:school_districts(
            id,
            name,
            code
          )
        )
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching extended profile:', error);
      return null;
    }

    return profile as ExtendedUserProfile;
  } catch (error) {
    console.error('Error in getExtendedUserProfile:', error);
    return null;
  }
};

/**
 * Get admin school data including statistics and classroom information
 */
export const getAdminSchoolData = async (userId: string): Promise<AdminSchoolData | null> => {
  try {
    // Get user's school
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id, school:schools(*)')
      .eq('id', userId)
      .single();

    if (!profile?.school_id) return null;

    // Get school statistics
    const { data: schoolStats } = await supabase
      .from('school_certification_stats')
      .select('*')
      .eq('school_id', profile.school_id);

    // Get basic counts
    const { count: classCount } = await supabase
      .from('classes')
      .select('*', { count: 'exact' })
      .eq('school_id', profile.school_id);

    const { count: teacherCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('school_id', profile.school_id)
      .eq('role', 'teacher');

    const { count: studentCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('school_id', profile.school_id)
      .eq('role', 'student');

    return {
      school: profile.school,
      total_classes: classCount || 0,
      total_teachers: teacherCount || 0,
      total_students: studentCount || 0,
      certification_stats: schoolStats || []
    };
  } catch (error) {
    console.error('Error fetching admin school data:', error);
    return null;
  }
};

/**
 * Get classroom data for school admins
 */
export const getSchoolClassroomData = async (userId: string): Promise<TeacherClassData[]> => {
  try {
    // Get user's school
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', userId)
      .single();

    if (!profile?.school_id) return [];

    // Get all classes in the school with teacher and enrollment info
    const { data: classes } = await supabase
      .from('classes')
      .select(`
        *,
        subject:subjects(*),
        grade_level:grade_levels(*),
        teacher:profiles!classes_teacher_id_fkey(id, display_name, email),
        student_enrollments(*)
      `)
      .eq('school_id', profile.school_id);

    if (!classes) return [];

    // Transform to TeacherClassData format
    const classroomData: TeacherClassData[] = await Promise.all(
      classes.map(async (classInfo) => {
        // Get enrollment count
        const enrollmentCount = classInfo.student_enrollments?.length || 0;

        // Get usage stats for this class
        const { data: usageStats } = await supabase
          .from('student_usage_metrics')
          .select('*')
          .eq('class_id', classInfo.id)
          .order('week_starting', { ascending: false })
          .limit(4); // Last 4 weeks

        // Get certification stats for this class
        const { data: certStats } = await supabase
          .from('class_certification_stats')
          .select('*')
          .eq('class_id', classInfo.id);

        return {
          class_info: classInfo,
          enrollment_count: enrollmentCount,
          usage_stats: usageStats || [],
          certification_stats: certStats || []
        };
      })
    );

    return classroomData;
  } catch (error) {
    console.error('Error fetching school classroom data:', error);
    return [];
  }
};

/**
 * Get district schools data
 */
export const getDistrictSchoolsData = async (userId: string): Promise<DistrictSchoolData[]> => {
  try {
    // Get user's district
    const { data: districtUser } = await supabase
      .from('district_users')
      .select('district_id')
      .eq('user_id', userId)
      .single();

    if (!districtUser?.district_id) return [];

    // Get schools in district with stats
    const { data: schools } = await supabase
      .from('schools')
      .select(`
        *,
        school_certification_stats(*)
      `)
      .eq('district_id', districtUser.district_id);

    if (!schools) return [];

    // Transform to DistrictSchoolData format
    const schoolsData: DistrictSchoolData[] = await Promise.all(
      schools.map(async (school) => {
        // Get student and class counts
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('school_id', school.id)
          .eq('role', 'student');

        const { count: classCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact' })
          .eq('school_id', school.id);

        // Calculate average certification score
        const certStats = school.school_certification_stats || [];
        const avgScore = certStats.length > 0
          ? certStats.reduce((sum: number, stat: any) => sum + (stat.avg_score || 0), 0) / certStats.length
          : 0;

        return {
          school,
          avg_certification_score: avgScore,
          total_students: studentCount || 0,
          total_classes: classCount || 0,
          certification_stats: certStats
        };
      })
    );

    return schoolsData;
  } catch (error) {
    console.error('Error fetching district schools data:', error);
    return [];
  }
};

/**
 * Get student enrollments
 */
export const getStudentEnrollments = async (userId: string): Promise<StudentEnrollment[]> => {
  try {
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        class_info:classes(
          *,
          subject:subjects(*),
          grade_level:grade_levels(*),
          teacher:profiles!classes_teacher_id_fkey(display_name, email)
        )
      `)
      .eq('student_id', userId)
      .eq('status', 'active');

    // Transform the data to match the expected type
    const transformedEnrollments: StudentEnrollment[] = (enrollments || []).map(enrollment => ({
      ...enrollment,
      status: enrollment.status as 'active' | 'dropped' | 'completed'
    }));

    return transformedEnrollments;
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    return [];
  }
};

/**
 * Get student grades
 */
export const getStudentGrades = async (userId: string): Promise<StudentGrade[]> => {
  try {
    const { data: grades } = await supabase
      .from('student_grades')
      .select(`
        *,
        assignment:assignments(*)
      `)
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return grades || [];
  } catch (error) {
    console.error('Error fetching student grades:', error);
    return [];
  }
};

/**
 * Get student usage metrics
 */
export const getStudentUsageMetrics = async (userId: string): Promise<StudentUsageMetrics[]> => {
  try {
    const { data: metrics } = await supabase
      .from('student_usage_metrics')
      .select('*')
      .eq('student_id', userId)
      .order('week_starting', { ascending: false })
      .limit(12); // Last 12 weeks

    return metrics || [];
  } catch (error) {
    console.error('Error fetching student usage metrics:', error);
    return [];
  }
};
