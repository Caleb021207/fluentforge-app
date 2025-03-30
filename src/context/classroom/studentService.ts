
import { supabase } from '@/integrations/supabase/client';
import { Classroom, StudentClassroom } from '@/types/supabase';
import { StudentProfile as StudentProfileType } from './types';

export async function fetchEnrolledClassrooms(
  userId: string
): Promise<{ classroom: Classroom; enrollment: StudentClassroom }[]> {
  try {
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('student_classrooms')
      .select('*, classroom:classrooms(*)')
      .eq('student_id', userId);

    if (enrollmentError) {
      console.error('Error fetching student enrollments:', enrollmentError);
      return [];
    }

    // Format enrollments
    const formattedEnrollments = enrollments.map((item: any) => ({
      classroom: item.classroom as Classroom,
      enrollment: {
        id: item.id,
        student_id: item.student_id,
        classroom_id: item.classroom_id,
        joined_at: item.joined_at
      } as StudentClassroom
    }));

    return formattedEnrollments;
  } catch (error) {
    console.error('Error in fetchEnrolledClassrooms:', error);
    return [];
  }
}

export async function joinClassroom(classCode: string, userId: string): Promise<boolean> {
  try {
    // Find the classroom with this code
    const { data: classroom, error: findError } = await supabase
      .from('classrooms')
      .select('*')
      .eq('class_code', classCode)
      .single();

    if (findError) {
      console.error('Invalid class code:', findError);
      return false;
    }

    // Check if already enrolled
    const { data: existing, error: checkError } = await supabase
      .from('student_classrooms')
      .select('*')
      .eq('student_id', userId)
      .eq('classroom_id', classroom.id)
      .maybeSingle();

    if (existing) {
      console.error('Already enrolled in this classroom');
      return false;
    }

    // Enroll the student
    const { error } = await supabase
      .from('student_classrooms')
      .insert({
        student_id: userId,
        classroom_id: classroom.id
      });

    if (error) {
      console.error('Error joining classroom:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in joinClassroom:', error);
    return false;
  }
}

export async function leaveClassroom(classroomId: string, enrollmentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('student_classrooms')
      .delete()
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error leaving classroom:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in leaveClassroom:', error);
    return false;
  }
}

export async function fetchStudentsInClassroom(classroomId: string): Promise<StudentProfileType[]> {
  try {
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('student_classrooms')
      .select('student_id, joined_at')
      .eq('classroom_id', classroomId);

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return [];
    }

    // Now fetch user profiles for these students
    const studentIds = enrollments.map((e: any) => e.student_id);
    
    if (studentIds.length === 0) return [];
    
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url')
      .in('id', studentIds);

    if (profilesError) {
      console.error('Error fetching student profiles:', profilesError);
      return [];
    }

    // Get today's usage stats for these students
    const today = new Date().toISOString().split('T')[0];
    const { data: stats, error: statsError } = await supabase
      .from('usage_stats')
      .select('user_id, text_chat_count, voice_minutes_used')
      .in('user_id', studentIds)
      .eq('date', today);

    if (statsError) {
      console.error('Error fetching student stats:', statsError);
    }

    // Merge the data
    const students = enrollments.map((enrollment: any) => {
      const profile = profiles?.find((p: any) => p.id === enrollment.student_id) || {
        id: enrollment.student_id,
        display_name: 'Unknown User',
        avatar_url: null
      };
      
      const usage = stats?.find((s: any) => s.user_id === enrollment.student_id) || {
        text_chat_count: 0,
        voice_minutes_used: 0
      };
      
      return {
        id: enrollment.student_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        joined_at: enrollment.joined_at,
        text_chat_count: usage.text_chat_count,
        voice_minutes_used: usage.voice_minutes_used
      };
    });

    return students;
  } catch (error) {
    console.error('Error in fetchStudentsInClassroom:', error);
    return [];
  }
}
