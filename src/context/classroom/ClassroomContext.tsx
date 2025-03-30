
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Classroom, StudentClassroom, UserRole, UsageStats } from '@/types/supabase';
import { ClassroomContextType, ClassroomProviderProps } from './types';
import * as classroomService from './classroomService';
import * as studentService from './studentService';
import * as userService from './userService';

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error('useClassroom must be used within a ClassroomProvider');
  }
  return context;
};

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
      const role = await userService.fetchUserRole(user!.id);
      if (role) {
        setUserRoleState(role);
      }
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
      const teacherClassrooms = await classroomService.fetchUserClassrooms(user!.id);
      setUserClassrooms(teacherClassrooms);

      // Fetch classrooms where user is a student
      const studentEnrollments = await studentService.fetchEnrolledClassrooms(user!.id);
      setEnrolledClassrooms(studentEnrollments);
    } catch (error) {
      console.error('Error in fetchUserClassrooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const stats = await userService.fetchUsageStats(user!.id);
      if (stats) {
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Error in fetchUsageStats:', error);
    }
  };

  const setUserRole = async (role: UserRole) => {
    try {
      const success = await userService.setUserRole(user!.id, role);
      
      if (!success) {
        toast({
          title: 'Error updating role',
          description: 'Failed to update user role',
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
      const classroom = await classroomService.createClassroom(name, user!.id);
      
      if (!classroom) {
        toast({
          title: 'Error creating classroom',
          description: 'Failed to create classroom',
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Classroom created',
        description: `Class code: ${classroom.class_code}`,
      });

      await fetchUserClassrooms();
      return classroom;
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
      const success = await studentService.joinClassroom(classCode, user!.id);
      
      if (!success) {
        toast({
          title: 'Error joining classroom',
          description: 'Could not join the classroom',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Classroom joined',
        description: 'You have joined the classroom',
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

      const success = await studentService.leaveClassroom(classroomId, enrollment.id);
      
      if (!success) {
        toast({
          title: 'Error leaving classroom',
          description: 'Could not leave the classroom',
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
      const success = await classroomService.deleteClassroom(classroomId);
      
      if (!success) {
        toast({
          title: 'Error deleting classroom',
          description: 'Could not delete the classroom',
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
      const newClassCode = await classroomService.resetClassCode(classroomId);
      
      if (!newClassCode) {
        toast({
          title: 'Error resetting class code',
          description: 'Could not reset the class code',
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
    return await studentService.fetchStudentsInClassroom(classroomId);
  };

  const fetchStudentStats = async (studentId: string): Promise<UsageStats | null> => {
    return await userService.fetchStudentStats(studentId);
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
