
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClassStudentsList from './ClassStudentsList';
import { useLocalization } from "@/context/LocalizationContext";

interface ClassItem {
  id: string;
  class_name: string;
  code: string;
  active: boolean;
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
          .from('classroom_codes')
          .select(`
            id,
            class_name,
            code,
            active,
            created_at
          `)
          .eq('teacher_id', (await supabase.auth.getUser()).data.user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const classesWithCount = await Promise.all(
          (data || []).map(async (classItem) => {
            const { count, error: countError } = await supabase
              .from('classroom_memberships')
              .select('*', { count: 'exact', head: true })
              .eq('classroom_id', classItem.id);

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
          title: t("error"),
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [toast, t]);

  const toggleClassStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('classroom_codes')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setClasses(classes.map(c => 
        c.id === id ? { ...c, active: !currentStatus } : c
      ));

      toast({
        title: t("success"),
        description: !currentStatus ? t("classActivated") : t("classDeactivated"),
      });
    } catch (error: any) {
      toast({
        title: t("error"),
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
              <CardTitle className="text-lg">{classItem.class_name}</CardTitle>
              <Badge variant={classItem.active ? "default" : "outline"}>
                {classItem.active ? t("active") : t("inactive")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">{t("code")}:</span> {classItem.code}
              </div>
              <div>
                <span className="font-medium">{t("students")}:</span> {classItem.student_count || 0}
              </div>
              <div>
                <span className="font-medium">{t("created")}:</span> {new Date(classItem.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedClass({ id: classItem.id, name: classItem.class_name })}
              >
                <Users className="mr-2 h-4 w-4" />
                {t("viewStudents")}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleClassStatus(classItem.id, classItem.active)}
              >
                {classItem.active ? t("deactivate") : t("activate")}
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
