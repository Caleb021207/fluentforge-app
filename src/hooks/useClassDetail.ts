
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTeacherStatus } from '@/hooks/useTeacherStatus';
import { ClassData } from '@/types/classroom';

export const useClassDetail = (
  id: string | undefined,
  t: (key: string, replacements?: Record<string, string>) => string
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isTeacher } = useTeacherStatus();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStudentsList, setShowStudentsList] = useState(false);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setIsLoading(true);
        
        if (!id) {
          console.error("No class ID provided");
          throw new Error("No class ID provided");
        }

        console.log(`Fetching class data for ID: ${id}, isTeacher: ${isTeacher}`);

        // Get authenticated user
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user?.id) {
          console.error("No authenticated session found");
          toast({
            title: t("loginRequired") || "Login Required",
            description: t("pleaseLoginToAccessFeature") || "Please login to access this feature",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        const userId = sessionData.session.user.id;
        console.log(`User ID: ${userId}`);

        // First step: Just get the class information by ID without filtering by user yet
        const { data: classInfo, error: classError } = await supabase
          .from('classroom_codes')
          .select(`
            id, 
            class_name,
            code,
            created_at,
            teacher_id
          `)
          .eq('id', id)
          .single();
          
        if (classError) {
          console.error('Error fetching class info:', classError);
          throw new Error(`Failed to find class: ${classError.message}`);
        }

        if (!classInfo) {
          console.error('No class found with ID:', id);
          throw new Error("Class not found");
        }

        console.log('Found class:', classInfo);
        console.log('Class teacher ID:', classInfo.teacher_id);
        console.log('Current user ID:', userId);
        console.log('Is user a teacher?', isTeacher);

        // Second step: Verify access based on role
        let hasAccess = false;
        let studentCount = 0;
        let teacherProfile: { display_name: string | null; email: string | null; } | null = null;

        if (isTeacher) {
          // For teachers, check if they own the class
          hasAccess = classInfo.teacher_id === userId;
          console.log(`Teacher access check: User ${userId} is${hasAccess ? '' : ' not'} the owner of class ${id}`);
          
          if (hasAccess) {
            // Get student count
            const { data: membershipsData, error: membershipsError } = await supabase
              .from('classroom_memberships')
              .select('count')
              .eq('classroom_id', id);
              
            if (membershipsError) {
              console.error('Error fetching memberships:', membershipsError);
            } else {
              studentCount = membershipsData[0]?.count || 0;
            }
          }
        } else {
          // For students, check if they are members of the class
          const { data: membershipData, error: membershipError } = await supabase
            .from('classroom_memberships')
            .select()
            .eq('classroom_id', id)
            .eq('student_id', userId)
            .maybeSingle();
            
          hasAccess = !!membershipData;
          console.log(`Student access check: User ${userId} is${hasAccess ? '' : ' not'} a member of class ${id}`);
          
          // Get teacher profile
          if (hasAccess && classInfo.teacher_id) {
            const { data: teacherData, error: teacherError } = await supabase
              .from('profiles')
              .select('display_name, email')
              .eq('id', classInfo.teacher_id)
              .maybeSingle();
              
            if (!teacherError && teacherData) {
              teacherProfile = teacherData;
            }
          }
        }

        if (!hasAccess) {
          console.error('User does not have access to this class');
          toast({
            title: t("accessDenied") || "Access Denied",
            description: t("classNotFound") || "Class not found or you don't have access",
            variant: "destructive",
          });
          // Navigate to the appropriate route based on role
          navigate(isTeacher ? '/teacher/classes' : '/student/class');
          return;
        }

        // Construct the final class data object
        const classData: ClassData = {
          id: classInfo.id,
          class_name: classInfo.class_name,
          teacher_id: classInfo.teacher_id,
          teacher_name: teacherProfile?.display_name || undefined,
          teacher_email: teacherProfile?.email || undefined,
          student_count: studentCount,
          created_at: new Date(classInfo.created_at).toLocaleDateString(),
          code: classInfo.code
        };

        console.log('Final class data:', classData);
        setClassData(classData);
        
      } catch (error: any) {
        console.error("Error fetching class data:", error);
        toast({
          title: t("error") || "Error",
          description: error.message || t("failedToLoadClassData") || "Failed to load class data",
          variant: "destructive",
        });
        // Navigate to the appropriate route based on role
        navigate(isTeacher ? '/teacher/classes' : '/student/class');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [id, navigate, toast, t, isTeacher]);

  const handleBackClick = () => {
    // Navigate to the appropriate route based on role
    navigate(isTeacher ? '/teacher/classes' : '/student/class');
  };

  return {
    classData,
    isLoading,
    showStudentsList,
    setShowStudentsList,
    handleBackClick,
    isTeacher
  };
};

export default useClassDetail;
