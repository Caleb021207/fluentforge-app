import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Trash2, UserPlus } from "lucide-react";
import { ClassroomWithStudents } from './types/classroomTypes';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { useLocalization } from "@/hooks/useLocalization";

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
      const { data, error } = await supabase
        .from('classrooms_with_student_counts')
        .select('*');

      if (error) throw error;
      setClasses(data || []);
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
  }, [toast, t]);

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      const { error } = await supabase
        .from('classrooms')
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

      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialog.Content className="sm:max-w-[425px]">
          <AlertDialog.Header>
            <AlertDialog.Title>{t("confirmDeletion")}</AlertDialog.Title>
            <AlertDialog.Description>
              {t("deletionWarning")}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <div className="flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={handleDeleteClass}>
                {t("delete")}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};

export default ClassList;
