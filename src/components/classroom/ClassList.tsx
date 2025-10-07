
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClassStudentsList from './ClassStudentsList';
import { useLocalization } from "@/context/LocalizationContext";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface ClassItem {
  id: string;
  name: string;
  class_code: string;
  created_at: string;
  student_count?: number;
}

const ClassList = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            class_code,
            created_at
          `)
          .eq('teacher_id', (await supabase.auth.getUser()).data.user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const classesWithCount = await Promise.all(
          (data || []).map(async (classItem) => {
            const { count, error: countError } = await supabase
              .from('student_enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', classItem.id);

            if (countError) {
              console.error('Error fetching student count:', countError);
              return classItem;
            }

            return {
              ...classItem,
              student_count: count || 0
            };
          })
        );

        setClasses(classesWithCount);
      } catch (error: any) {
        console.error('Error fetching classes:', error);
        toast({
          title: CLASSROOM_TEXT.ERROR,
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [toast]);

  const deleteClass = async (id: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClasses(classes.filter(c => c.id !== id));

      toast({
        title: CLASSROOM_TEXT.SUCCESS,
        description: "Class deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: CLASSROOM_TEXT.ERROR,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{t("noClassesCreated")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((classItem) => (
        <Card key={classItem.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{classItem.name}</CardTitle>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">{CLASSROOM_TEXT.CLASS_CODE}:</span> {classItem.class_code}
              </div>
              <div>
                <span className="font-medium">{CLASSROOM_TEXT.STUDENTS}:</span> {classItem.student_count || 0}
              </div>
              <div>
                <span className="font-medium">{t("created")}:</span> {new Date(classItem.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedClass({ id: classItem.id, name: classItem.name })}
              >
                <Users className="mr-2 h-4 w-4" />
                {CLASSROOM_TEXT.STUDENTS}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedClass && (
        <ClassStudentsList
          classId={selectedClass.id}
          className={selectedClass.name}
          open={!!selectedClass}
          onOpenChange={(open) => !open && setSelectedClass(null)}
        />
      )}
    </div>
  );
};

export default ClassList;
