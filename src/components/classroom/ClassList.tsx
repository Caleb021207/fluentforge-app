
import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Trash2, UserPlus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLocalization } from "@/hooks/useLocalization";

interface ClassroomWithStudents {
  id: string;
  class_name: string;
  student_count: number;
}

const ClassList = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassroomWithStudents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      // This is a simplified query since we don't have the exact table structure
      const { data, error } = await supabase
        .from('classroom_codes')
        .select('id, class_name, code');

      if (error) throw error;
      
      // Transform the data to match our expected interface
      const transformedData = (data || []).map(classroom => ({
        id: classroom.id,
        class_name: classroom.class_name,
        student_count: 0 // This would need to be populated from another query
      }));
      
      setClasses(transformedData);
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      const { error } = await supabase
        .from('classroom_codes')
        .delete()
        .eq('id', classToDelete);

      if (error) throw error;

      toast({
        title: t("success"),
        description: t("classDeletedSuccessfully"),
      });
      fetchClasses();
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("myClasses")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">{t("loading")}</div>
          ) : classes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {t("noClassesCreated")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("className")}</TableHead>
                  <TableHead className="text-right">{t("students")}</TableHead>
                  <TableHead className="w-[150px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <td>{classroom.class_name}</td>
                    <td className="text-right">{classroom.student_count}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setClassToDelete(classroom.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("delete")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => alert('Not yet implemented')}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t("add")}
                        </Button>
                      </div>
                    </td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeletion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deletionWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDeleteClass}>
                {t("delete")}
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClassList;
