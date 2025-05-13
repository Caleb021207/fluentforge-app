
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useTeacherStatus } from '@/hooks/useTeacherStatus';
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ClassStudentsList from "@/components/classroom/ClassStudentsList";
import AnimatedLoader from "@/components/ui/animated-loader";
import { ChevronLeft } from "lucide-react";

interface ClassData {
  id: string;
  class_name: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_email?: string;
  student_count: number;
  created_at: string;
  code: string;
}

interface TeacherProfile {
  display_name: string | null;
  email: string | null;
}

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocalization();
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

        // Second step: Verify access based on role
        let hasAccess = false;
        let studentCount = 0;
        let teacherProfile: TeacherProfile | null = null;

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
        navigate(isTeacher ? '/teacher/classes' : '/student/class');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [id, navigate, toast, t, isTeacher]);

  const handleBackClick = () => {
    navigate(isTeacher ? '/teacher/classes' : '/student/class');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <AnimatedLoader 
          size="lg" 
          color="text-palavox-primary"
          message={t("loading") || "Loading"}
        />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-2xl text-muted-foreground">{t("classNotFound") || "Class not found"}</p>
          <Button 
            onClick={handleBackClick} 
            className="mt-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("backToClasses") || "Back to Classes"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4"
        onClick={handleBackClick}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        {t("backToClasses") || "Back to Classes"}
      </Button>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{classData.class_name}</CardTitle>
          <CardDescription>
            {isTeacher 
              ? t("studentsEnrolled", { count: String(classData.student_count) }) 
              : t("teacher") + ": " + (classData.teacher_name || t("unnamed"))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">{CLASSROOM_TEXT.CLASS_CODE}</p>
              <p className="text-lg font-mono bg-muted p-2 rounded">{classData.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t("created") || "Created"}</p>
              <p>{classData.created_at}</p>
            </div>
          </div>

          {isTeacher && (
            <div className="mt-6">
              <Button 
                onClick={() => setShowStudentsList(true)} 
                className="w-full sm:w-auto"
              >
                {t("viewStudents") || "View Students"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isTeacher && (
        <ClassStudentsList
          classId={classData.id}
          className={classData.class_name}
          open={showStudentsList}
          onOpenChange={setShowStudentsList}
        />
      )}
    </div>
  );
};

export default ClassDetail;
