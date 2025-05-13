
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface ClassItem {
  id: string;
  className: string;
  studentCount: number;
}

interface ClassListProps {
  onClassSelect?: (classId: string, className: string) => void;
}

const ClassList: React.FC<ClassListProps> = ({ onClassSelect }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocalization();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session?.user?.id) {
          console.error("No authenticated user found");
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        const { data, error } = await supabase
          .from('classroom_codes')
          .select(`
            id, 
            className,
            classroom_memberships (count)
          `)
          .eq('teacher_id', userId);

        if (error) {
          console.error("Error fetching classes:", error);
          toast({
            title: t("error"),
            description: t("failedToLoadClasses"),
            variant: "destructive",
          });
          return;
        }

        const classList: ClassItem[] = data.map(classroom => ({
          id: classroom.id,
          className: classroom.className,
          studentCount: classroom.classroom_memberships ? classroom.classroom_memberships[0].count : 0,
        }));

        setClasses(classList);
      } catch (error: any) {
        console.error("Unexpected error fetching classes:", error);
        toast({
          title: t("error"),
          description: t("unexpectedError"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [toast, t]);

  const handleViewClass = (classId: string) => {
    navigate(`/class/${classId}`);
  };

  const handleClassSelect = (classId: string, className: string) => {
    setSelectedClassId(classId);
    if (onClassSelect) {
      onClassSelect(classId, className);
    }
  };

  const EmptyState = () => (
    <div className="text-center py-8">
      <p className="text-muted-foreground">{t("noClasses")}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((classItem) => (
            <Card 
              key={classItem.id} 
              className={`cursor-pointer hover:border-primary/50 transition-colors ${selectedClassId === classItem.id ? 'border-primary' : ''}`}
              onClick={() => handleClassSelect(classItem.id, classItem.className)}
            >
              <CardHeader>
                <CardTitle>{classItem.className}</CardTitle>
                <CardDescription>
                  {t("studentsEnrolled", { count: String(classItem.studentCount) })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card onClick
                      handleViewClass(classItem.id);
                    }}
                  >
                    {t("viewClass")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default ClassList;
