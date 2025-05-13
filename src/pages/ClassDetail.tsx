
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
          throw new Error("No class ID provided");
        }

        // Get authenticated user
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user?.id) {
          navigate('/');
          return;
        }

        // Check if user is teacher or student to determine data access
        let classInfo;
        
        if (isTeacher) {
          // Teacher view - Get class data they own
          const { data, error } = await supabase
            .from('classroom_codes')
            .select(`
              id, 
              class_name,
              code,
              created_at,
              teacher_id,
              classroom_memberships (count)
            `)
            .eq('id', id)
            .eq('teacher_id', sessionData.session.user.id)
            .single();
            
          if (error) throw error;
          if (!data) throw new Error("Class not found or you don't have access");
          
          classInfo = {
            id: data.id,
            class_name: data.class_name,
            teacher_id: data.teacher_id,
            student_count: data.classroom_memberships[0].count,
            created_at: new Date(data.created_at).toLocaleDateString(),
            code: data.code
          };
        } else {
          // Student view - Get class data they're a member of
          const { data, error } = await supabase
            .from('classroom_memberships')
            .select(`
              classroom_id,
              classroom_codes (
                id,
                class_name,
                code,
                created_at,
                teacher_id
              )
            `)
            .eq('classroom_id', id)
            .eq('student_id', sessionData.session.user.id)
            .maybeSingle();
            
          if (error) throw error;
          if (!data || !data.classroom_codes) {
            throw new Error("Class not found or you don't have access");
          }
          
          // Get teacher profile in a separate query if we have teacher_id
          let teacherName;
          let teacherEmail;
          
          if (data.classroom_codes.teacher_id) {
            const { data: teacherData, error: teacherError } = await supabase
              .from('profiles')
              .select('display_name, email')
              .eq('id', data.classroom_codes.teacher_id)
              .maybeSingle();
              
            if (!teacherError && teacherData) {
              teacherName = teacherData.display_name;
              teacherEmail = teacherData.email;
            }
          }
          
          classInfo = {
            id: data.classroom_codes.id,
            class_name: data.classroom_codes.class_name,
            teacher_id: data.classroom_codes.teacher_id,
            teacher_name: teacherName || undefined,
            teacher_email: teacherEmail || undefined,
            student_count: 0, // Students can't see this
            created_at: new Date(data.classroom_codes.created_at).toLocaleDateString(),
            code: data.classroom_codes.code
          };
        }
        
        setClassData(classInfo);
      } catch (error: any) {
        console.error("Error fetching class data:", error);
        toast({
          title: t("error"),
          description: error.message || t("failedToLoadClassData"),
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
          message={t("loading")}
        />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-2xl text-muted-foreground">{t("classNotFound")}</p>
          <Button 
            onClick={handleBackClick} 
            className="mt-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("backToClasses")}
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
