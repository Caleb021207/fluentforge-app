
import { supabase } from "@/integrations/supabase/client";
import { ExtendedUserProfile, StudentEnrollment, ClassInfo, StudentGrade, Assignment, StudentUsageMetrics, ClassCertificationStats, SchoolCertificationStats, TeacherClassData, AdminSchoolData, DistrictSchoolData } from "@/types/school";

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
          grade_level:grade_levels(*),
          teacher:profiles!classes_teacher_id_fkey(id, display_name, email)
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

export const getTeacherClassData = async (teacherId: string): Promise<TeacherClassData[]> => {
  try {
    const classes = await getTeacherClasses(teacherId);
    
    const classDataPromises = classes.map(async (classInfo) => {
      // Get enrollment count
      const { count } = await supabase
        .from('student_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classInfo.id)
        .eq('status', 'active');

      // Get usage stats
      const { data: usageStats } = await supabase
        .from('student_usage_metrics')
        .select('*')
        .eq('class_id', classInfo.id);

      // Get certification stats
      const { data: certStats } = await supabase
        .from('class_certification_stats')
        .select('*')
        .eq('class_id', classInfo.id);

      return {
        class_info: classInfo,
        enrollment_count: count || 0,
        usage_stats: usageStats || [],
        certification_stats: certStats || []
      };
    });

    return await Promise.all(classDataPromises);
  } catch (error) {
    console.error('Error in getTeacherClassData:', error);
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

export const getStudentUsageMetrics = async (studentId: string): Promise<StudentUsageMetrics[]> => {
  try {
    const { data, error } = await supabase
      .from('student_usage_metrics')
      .select('*')
      .eq('student_id', studentId)
      .order('week_starting', { ascending: false })
      .limit(12); // Last 12 weeks

    if (error) {
      console.error('Error fetching student usage metrics:', error);
      return [];
    }

    return data as StudentUsageMetrics[];
  } catch (error) {
    console.error('Error in getStudentUsageMetrics:', error);
    return [];
  }
};

export const getAdminSchoolData = async (adminId: string): Promise<AdminSchoolData | null> => {
  try {
    const profile = await getExtendedUserProfile(adminId);
    if (!profile?.school_id) return null;

    // Get school details
    const { data: school } = await supabase
      .from('schools')
      .select('*')
      .eq('id', profile.school_id)
      .single();

    // Get total classes count
    const { count: totalClasses } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile.school_id);

    // Get total teachers count
    const { count: totalTeachers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile.school_id)
      .eq('role', 'teacher');

    // Get total students count
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile.school_id)
      .eq('role', 'student');

    // Get certification stats
    const { data: certStats } = await supabase
      .from('school_certification_stats')
      .select('*')
      .eq('school_id', profile.school_id);

    return {
      school: school!,
      total_classes: totalClasses || 0,
      total_teachers: totalTeachers || 0,
      total_students: totalStudents || 0,
      certification_stats: certStats || []
    };
  } catch (error) {
    console.error('Error in getAdminSchoolData:', error);
    return null;
  }
};

export const getDistrictSchoolsData = async (districtUserId: string): Promise<DistrictSchoolData[]> => {
  try {
    // Get district assignment
    const { data: districtUser } = await supabase
      .from('district_users')
      .select('district_id')
      .eq('user_id', districtUserId)
      .single();

    if (!districtUser) return [];

    // Get schools in district
    const { data: schools } = await supabase
      .from('schools')
      .select('*')
      .eq('district_id', districtUser.district_id);

    if (!schools) return [];

    const schoolDataPromises = schools.map(async (school) => {
      // Get certification stats
      const { data: certStats } = await supabase
        .from('school_certification_stats')
        .select('*')
        .eq('school_id', school.id);

      // Calculate average certification score
      const avgScore = certStats?.length 
        ? certStats.reduce((sum, stat) => sum + (stat.avg_score || 0), 0) / certStats.length
        : 0;

      // Get total students
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', school.id)
        .eq('role', 'student');

      // Get total classes
      const { count: totalClasses } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', school.id);

      return {
        school,
        avg_certification_score: avgScore,
        total_students: totalStudents || 0,
        total_classes: totalClasses || 0,
        certification_stats: certStats || []
      };
    });

    return await Promise.all(schoolDataPromises);
  } catch (error) {
    console.error('Error in getDistrictSchoolsData:', error);
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

// Helper function to check user role and permissions
export const checkUserRole = async (userId: string, requiredRole: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return data?.role === requiredRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};
