import { supabase } from "@/integrations/supabase/client";
import { StudentEnrollment, StudentGrade, StudentUsageMetrics, ExtendedUserProfile, AdminSchoolData, TeacherClassData, DistrictSchoolData, UserRole } from "@/types/school";

export const getStudentEnrollments = async (studentId: string): Promise<StudentEnrollment[]> => {
  try {
    console.log('Fetching enrollments for student:', studentId);
    
    const { data, error } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        class_info:classes!inner (
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
      .eq('status', 'active')
      .not('class_info', 'is', null);

    if (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }

    console.log('Enrollment data retrieved:', data?.length || 0, 'enrollments');
    
    // Filter out any enrollments where class_info is null (shouldn't happen with inner join but being safe)
    const validEnrollments = (data || []).filter(item => item.class_info !== null);
    
    // Cast the data to match our interface, ensuring status is properly typed
    return validEnrollments.map(item => ({
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
    console.log('getExtendedUserProfile: Getting extended profile for user:', userId);
    
    // Get basic profile with better error handling
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('getExtendedUserProfile: Profile error:', profileError);
      // Don't throw here - let caller handle the absence of a profile
      return null;
    }

    if (!profile) {
      console.log('getExtendedUserProfile: No profile found for user');
      return null;
    }

    console.log('getExtendedUserProfile: Basic profile found:', profile);

    let extendedProfile: ExtendedUserProfile = {
      ...profile,
      school: null,
      district_associations: []
    };

    // If user has a school_id, fetch school info with better error handling
    if (profile.school_id) {
      try {
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', profile.school_id)
          .maybeSingle();

        if (!schoolError && school) {
          extendedProfile.school = school;
          console.log('getExtendedUserProfile: School data loaded:', school);
        } else {
          console.warn('getExtendedUserProfile: Could not load school data:', schoolError);
        }
      } catch (schoolFetchError) {
        console.warn('getExtendedUserProfile: School fetch failed:', schoolFetchError);
        // Continue without school data
      }
    }

    // For district admins, get district associations with better error handling
    if (profile.role === 'district') {
      try {
        const { data: districtUsers, error: districtError } = await supabase
          .from('district_users')
          .select(`
            id,
            user_id,
            district_id,
            role,
            consent_provided,
            consent_date,
            consent_type,
            created_at,
            updated_at,
            school_districts (
              id,
              name,
              code,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', userId);

        if (!districtError && districtUsers) {
          console.log('getExtendedUserProfile: District associations found:', districtUsers);
          extendedProfile.district_associations = districtUsers;
        } else {
          console.warn('getExtendedUserProfile: No district associations found for district admin:', districtError);
          extendedProfile.district_associations = [];
        }
      } catch (districtFetchError) {
        console.warn('getExtendedUserProfile: District associations fetch failed:', districtFetchError);
        extendedProfile.district_associations = [];
      }
    }

    console.log('getExtendedUserProfile: Extended profile complete:', extendedProfile);
    return extendedProfile;

  } catch (error) {
    console.error('getExtendedUserProfile: Unexpected error:', error);
    // Return null instead of throwing to allow fallback handling
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

    // Calculate total enrollments across all classes in the school
    let totalEnrollments = 0;
    if (classes && classes.length > 0) {
      const classIds = classes.map(c => c.id);
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('id')
        .in('class_id', classIds)
        .eq('status', 'active');
      
      totalEnrollments = enrollments?.length || 0;
    }

    // Get certification stats - calculate average from transcript analyses
    let avgCertificationScore = 0;
    if (totalEnrollments > 0) {
      // Get all students in the school through their class enrollments
      const { data: schoolStudents } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .in('class_id', classes?.map(c => c.id) || [])
        .eq('status', 'active');

      if (schoolStudents && schoolStudents.length > 0) {
        const studentIds = schoolStudents.map(s => s.student_id);
        
        // Get latest transcript analysis for each student
        const { data: transcriptScores } = await supabase
          .from('transcript_analyses')
          .select('user_id, overall_score')
          .in('user_id', studentIds)
          .not('overall_score', 'is', null);

        if (transcriptScores && transcriptScores.length > 0) {
          // Get the latest score for each student
          const latestScores = new Map();
          for (const score of transcriptScores) {
            if (!latestScores.has(score.user_id) || score.overall_score) {
              latestScores.set(score.user_id, score.overall_score);
            }
          }
          
          const scores = Array.from(latestScores.values()).filter(score => score !== null);
          if (scores.length > 0) {
            avgCertificationScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          }
        }
      }
    }

    const { data: certStats } = await supabase
      .from('school_certification_stats')
      .select('*')
      .eq('school_id', profile.school_id);

    return {
      school,
      total_classes: classes?.length || 0,
      total_teachers: teachers?.length || 0,
      total_students: totalEnrollments,
      avg_certification_score: avgCertificationScore,
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
    console.log('getDistrictSchoolsData: Getting district schools data for user:', userId);

    // First verify the user is a district admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || profile?.role !== 'district') {
      console.error('getDistrictSchoolsData: User is not a district admin:', profileError, profile);
      throw new Error('User is not authorized as district admin');
    }

    // Get district associations with complete data
    const { data: districtUsers, error: districtError } = await supabase
      .from('district_users')
      .select(`
        district_id,
        school_districts (
          id,
          name,
          code
        )
      `)
      .eq('user_id', userId);

    if (districtError) {
      console.error('getDistrictSchoolsData: District association error:', districtError);
      throw new Error('Failed to get district associations');
    }

    if (!districtUsers || districtUsers.length === 0) {
      console.warn('getDistrictSchoolsData: No district associations found');
      return [];
    }

    console.log('getDistrictSchoolsData: District associations:', districtUsers);

    // Get district IDs
    const districtIds = districtUsers.map(du => du.district_id);

    // Get schools in the districts
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .in('district_id', districtIds);

    if (schoolsError) {
      console.error('getDistrictSchoolsData: Schools query error:', schoolsError);
      throw new Error('Failed to fetch schools');
    }

    if (!schools || schools.length === 0) {
      console.warn('getDistrictSchoolsData: No schools found in districts');
      return [];
    }

    console.log('getDistrictSchoolsData: Schools found:', schools);

    // For each school, get aggregate data
    const schoolsData: DistrictSchoolData[] = [];

    for (const school of schools) {
      // Get total classes in school
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', school.id);

      const totalClasses = classes?.length || 0;

      // Get total students (via enrollments)
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select('student_id, classes!inner(school_id)')
        .eq('classes.school_id', school.id);

      // Count unique students
      const uniqueStudentIds = new Set(enrollments?.map(e => e.student_id) || []);
      const totalStudents = uniqueStudentIds.size;

      // Get certification stats for the school
      const { data: certStats, error: certError } = await supabase
        .from('school_certification_stats')
        .select('*')
        .eq('school_id', school.id);

      // Calculate average certification score
      let avgScore = 0;
      if (certStats && certStats.length > 0) {
        const totalScore = certStats.reduce((sum, stat) => sum + (stat.avg_score || 0), 0);
        avgScore = totalScore / certStats.length;
      }

      schoolsData.push({
        school,
        total_students: totalStudents,
        total_classes: totalClasses,
        avg_certification_score: avgScore,
        certification_stats: certStats || []
      });
    }

    console.log('getDistrictSchoolsData: District schools data:', schoolsData);
    return schoolsData;

  } catch (error) {
    console.error('getDistrictSchoolsData: Error in getDistrictSchoolsData:', error);
    throw error;
  }
};
