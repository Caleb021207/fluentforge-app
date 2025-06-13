import { supabase } from "@/integrations/supabase/client";
import { StudentEnrollment, StudentGrade, StudentUsageMetrics, ExtendedUserProfile, AdminSchoolData, TeacherClassData, DistrictSchoolData, UserRole } from "@/types/school";

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

    console.log('Enrollment data retrieved:', data?.length || 0, 'enrollments');
    
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
    console.log('Fetching extended profile for user:', userId);
    
    // First, get the basic profile without joins to avoid RLS issues
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching basic profile:', profileError);
      return null;
    }

    if (!profile) {
      console.log('No profile found for user:', userId);
      return null;
    }

    console.log('Basic profile found:', profile);

    // Now fetch related data separately if needed
    let school = null;
    let grade_level = null;

    if (profile.school_id) {
      try {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('*')
          .eq('id', profile.school_id)
          .single();
        school = schoolData;
      } catch (error) {
        console.log('Could not fetch school data:', error);
      }
    }

    if (profile.grade_level_id) {
      try {
        const { data: gradeLevelData } = await supabase
          .from('grade_levels')
          .select('*')
          .eq('id', profile.grade_level_id)
          .single();
        grade_level = gradeLevelData;
      } catch (error) {
        console.log('Could not fetch grade level data:', error);
      }
    }

    const extendedProfile: ExtendedUserProfile = {
      ...profile,
      role: profile.role as UserRole, // Cast to proper UserRole type
      school: school || undefined,
      grade_level: grade_level || undefined
    };

    console.log('Extended profile created:', extendedProfile);
    return extendedProfile;
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
    console.log('getDistrictSchoolsData: Starting fetch for user:', userId);
    
    // Get user's district assignments
    const { data: userDistricts, error: districtError } = await supabase
      .from('district_users')
      .select('district_id')
      .eq('user_id', userId);

    console.log('getDistrictSchoolsData: District assignments:', userDistricts, 'Error:', districtError);

    if (!userDistricts || userDistricts.length === 0) {
      console.log('getDistrictSchoolsData: No district assignments found');
      return [];
    }

    const districtIds = userDistricts.map(d => d.district_id);
    console.log('getDistrictSchoolsData: District IDs:', districtIds);

    // Get schools in the user's districts
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .in('district_id', districtIds);

    console.log('getDistrictSchoolsData: Schools found:', schools?.length || 0, 'Error:', schoolsError);

    if (!schools || schools.length === 0) {
      console.log('getDistrictSchoolsData: No schools found in districts');
      return [];
    }

    const districtData: DistrictSchoolData[] = [];

    for (const school of schools) {
      console.log('getDistrictSchoolsData: Processing school:', school.name, school.id);
      
      // Get classes for this school
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', school.id);

      console.log('getDistrictSchoolsData: Classes in', school.name, ':', classes?.length || 0, 'Error:', classesError);

      let totalEnrollments = 0;
      let studentIds: string[] = [];

      if (classes && classes.length > 0) {
        const classIds = classes.map(c => c.id);
        
        // Get student enrollments
        const { data: enrollments, error: enrollmentError } = await supabase
          .from('student_enrollments')
          .select('student_id')
          .in('class_id', classIds)
          .eq('status', 'active');
        
        console.log('getDistrictSchoolsData: Enrollments found:', enrollments?.length || 0, 'Error:', enrollmentError);
        
        totalEnrollments = enrollments?.length || 0;
        studentIds = enrollments?.map(e => e.student_id) || [];
      }

      // Calculate average score from transcript analyses
      let avgCertificationScore = 0;
      
      if (studentIds.length > 0) {
        console.log('getDistrictSchoolsData: Getting scores for students:', studentIds);
        
        // Get all transcript analyses for these students
        const { data: transcriptScores, error: scoresError } = await supabase
          .from('transcript_analyses')
          .select('user_id, overall_score, created_at')
          .in('user_id', studentIds)
          .not('overall_score', 'is', null)
          .order('created_at', { ascending: false });

        console.log('getDistrictSchoolsData: Transcript scores found:', transcriptScores?.length || 0, 'Error:', scoresError);

        if (transcriptScores && transcriptScores.length > 0) {
          // Get the latest score for each student
          const latestScores = new Map<string, number>();
          
          for (const score of transcriptScores) {
            if (!latestScores.has(score.user_id) && score.overall_score !== null) {
              latestScores.set(score.user_id, score.overall_score);
            }
          }
          
          const scores = Array.from(latestScores.values());
          console.log('getDistrictSchoolsData: Latest scores per student:', scores);
          
          if (scores.length > 0) {
            avgCertificationScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          }
        }
      }

      // Get certification stats
      const { data: certStats } = await supabase
        .from('school_certification_stats')
        .select('*')
        .eq('school_id', school.id);

      const schoolData = {
        school,
        avg_certification_score: avgCertificationScore,
        total_students: totalEnrollments,
        total_classes: classes?.length || 0,
        certification_stats: certStats || []
      };

      console.log('getDistrictSchoolsData: Final school data:', schoolData);
      districtData.push(schoolData);
    }

    console.log('getDistrictSchoolsData: Final district data:', districtData);
    return districtData;
  } catch (error) {
    console.error('Error in getDistrictSchoolsData:', error);
    return [];
  }
};
