
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { Classroom, StudentClassroom, UserSettings, UserRole, UsageStats } from '@/types/supabase';

interface ClassroomContextType {
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

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error('useClassroom must be used within a ClassroomProvider');
  }
  return context;
};

interface ClassroomProviderProps {
  children: ReactNode;
  user: User | null;
}

export const ClassroomProvider: React.FC<ClassroomProviderProps> = ({ children, user }) => {
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [userClassrooms, setUserClassrooms] = useState<Classroom[]>([]);
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<{classroom: Classroom, enrollment: StudentClassroom}[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isTeacher = userRole === 'teacher';
  const isStudent = userRole === 'student';
  const hasClassroom = isStudent ? enrolledClassrooms.length > 0 : userClassrooms.length > 0;

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchUserClassrooms();
      fetchUsageStats();
    } else {
      setUserRoleState(null);
      setUserClassrooms([]);
      setEnrolledClassrooms([]);
      setUsageStats(null);
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      setIsLoading(true);
      
      // Use typed query for user_settings table
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRoleState(data.role as UserRole);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserClassrooms = async () => {
    try {
      setIsLoading(true);
      
      // Fetch classrooms where user is a teacher
      const { data: teacherClassrooms, error: teacherError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', user!.id);

      if (teacherError) {
        console.error('Error fetching teacher classrooms:', teacherError);
        return;
      }

      setUserClassrooms(teacherClassrooms as Classroom[]);

      // Fetch classrooms where user is a student
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('student_classrooms')
        .select('*, classroom:classrooms(*)')
        .eq('student_id', user!.id);

      if (enrollmentError) {
        console.error('Error fetching student enrollments:', enrollmentError);
        return;
      }

      const formattedEnrollments = enrollments.map(item => ({
        classroom: item.classroom as Classroom,
        enrollment: {
          id: item.id,
          student_id: item.student_id,
          classroom_id: item.classroom_id,
          joined_at: item.joined_at
        } as StudentClassroom
      }));

      setEnrolledClassrooms(formattedEnrollments);
    } catch (error) {
      console.error('Error in fetchUserClassrooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Use typed query for usage_stats table
      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('Error fetching usage stats:', error);
        return;
      }

      if (data) {
        setUsageStats(data as UsageStats);
      } else {
        // Create today's usage stats if it doesn't exist
        const { data: newStats, error: createError } = await supabase
          .from('usage_stats')
          .insert({
            user_id: user!.id,
            date: today,
            text_chat_count: 0,
            voice_minutes_used: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating usage stats:', createError);
          return;
        }

        setUsageStats(newStats as UsageStats);
      }
    } catch (error) {
      console.error('Error in fetchUsageStats:', error);
    }
  };

  const setUserRole = async (role: UserRole) => {
    try {
      // Use typed query for user_settings table
      const { error } = await supabase
        .from('user_settings')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', user!.id);

      if (error) {
        toast({
          title: 'Error updating role',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setUserRoleState(role);
      toast({
        title: 'Role updated',
        description: `You are now a ${role}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createClassroom = async (name: string): Promise<Classroom | null> => {
    try {
      // Generate a class code using our database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_unique_class_code');

      if (codeError) {
        toast({
          title: 'Error generating class code',
          description: codeError.message,
          variant: 'destructive',
        });
        return null;
      }

      const classCode = codeData;

      // Use typed query for classrooms table
      const { data, error } = await supabase
        .from('classrooms')
        .insert({
          name,
          class_code: classCode,
          teacher_id: user!.id
        })
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error creating classroom',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Classroom created',
        description: `Class code: ${data.class_code}`,
      });

      await fetchUserClassrooms();
      return data as Classroom;
    } catch (error: any) {
      toast({
        title: 'Error creating classroom',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const joinClassroom = async (classCode: string): Promise<boolean> => {
    try {
      // Find the classroom with this code
      const { data: classroom, error: findError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('class_code', classCode)
        .single();

      if (findError) {
        toast({
          title: 'Invalid class code',
          description: 'Could not find a classroom with that code',
          variant: 'destructive',
        });
        return false;
      }

      // Check if already enrolled
      const { data: existing, error: checkError } = await supabase
        .from('student_classrooms')
        .select('*')
        .eq('student_id', user!.id)
        .eq('classroom_id', classroom.id)
        .maybeSingle();

      if (existing) {
        toast({
          title: 'Already enrolled',
          description: 'You are already enrolled in this classroom',
          variant: 'destructive',
        });
        return false;
      }

      // Enroll the student
      const { error } = await supabase
        .from('student_classrooms')
        .insert({
          student_id: user!.id,
          classroom_id: classroom.id
        });

      if (error) {
        toast({
          title: 'Error joining classroom',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Classroom joined',
        description: `You have joined ${classroom.name}`,
      });

      await fetchUserClassrooms();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error joining classroom',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const leaveClassroom = async (classroomId: string): Promise<boolean> => {
    try {
      const enrollment = enrolledClassrooms.find(e => e.classroom.id === classroomId)?.enrollment;
      
      if (!enrollment) {
        toast({
          title: 'Error leaving classroom',
          description: 'Enrollment not found',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('student_classrooms')
        .delete()
        .eq('id', enrollment.id);

      if (error) {
        toast({
          title: 'Error leaving classroom',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Classroom left',
        description: 'You have left the classroom',
      });

      await fetchUserClassrooms();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error leaving classroom',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteClassroom = async (classroomId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', classroomId);

      if (error) {
        toast({
          title: 'Error deleting classroom',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Classroom deleted',
        description: 'The classroom has been deleted',
      });

      await fetchUserClassrooms();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error deleting classroom',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const resetClassCode = async (classroomId: string): Promise<string | null> => {
    try {
      // Generate a new class code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_unique_class_code');

      if (codeError) {
        toast({
          title: 'Error generating class code',
          description: codeError.message,
          variant: 'destructive',
        });
        return null;
      }

      const newClassCode = codeData;

      // Update the classroom with the new code
      const { data, error } = await supabase
        .from('classrooms')
        .update({ class_code: newClassCode })
        .eq('id', classroomId)
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error resetting class code',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Class code reset',
        description: `New code: ${newClassCode}`,
      });

      await fetchUserClassrooms();
      return newClassCode;
    } catch (error: any) {
      toast({
        title: 'Error resetting class code',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const fetchStudentsInClassroom = async (classroomId: string) => {
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
      const studentIds = enrollments.map(e => e.student_id);
      
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
      const students = enrollments.map(enrollment => {
        const profile = profiles?.find(p => p.id === enrollment.student_id) || {
          id: enrollment.student_id,
          display_name: 'Unknown User',
          avatar_url: null
        };
        
        const usage = stats?.find(s => s.user_id === enrollment.student_id) || {
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
  };

  const fetchStudentStats = async (studentId: string): Promise<UsageStats | null> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', studentId)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('Error fetching student stats:', error);
        return null;
      }

      return data as UsageStats;
    } catch (error) {
      console.error('Error in fetchStudentStats:', error);
      return null;
    }
  };

  const value = {
    userRole,
    setUserRole,
    userClassrooms,
    enrolledClassrooms,
    usageStats,
    isLoading,
    createClassroom,
    joinClassroom,
    leaveClassroom,
    deleteClassroom,
    resetClassCode,
    fetchStudentsInClassroom,
    fetchStudentStats,
    isTeacher,
    isStudent,
    hasClassroom
  };

  return (
    <ClassroomContext.Provider value={value}>
      {children}
    </ClassroomContext.Provider>
  );
};
