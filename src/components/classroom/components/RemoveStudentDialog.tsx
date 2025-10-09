import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface RemoveStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  classId: string;
  onRemoved: () => void;
}

export const RemoveStudentDialog = ({
  open,
  onOpenChange,
  studentId,
  studentName,
  classId,
  onRemoved,
}: RemoveStudentDialogProps) => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    
    try {
      console.log('Attempting to remove student:', { studentId, classId, studentName });
      
      // First check how many enrollments exist
      const { data: existingEnrollments, error: checkError } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('student_id', studentId)
        .eq('class_id', classId);
      
      console.log('Existing enrollments found:', existingEnrollments);
      
      if (checkError) {
        console.error('Error checking enrollments:', checkError);
        throw checkError;
      }

      // Delete from student_enrollments table
      const { error, data: deletedData } = await supabase
        .from('student_enrollments')
        .delete()
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .select();

      console.log('Delete result:', { error, deletedData });

      if (error) throw error;

      toast({
        title: t("success"),
        description: t("studentRemoved"),
      });

      onOpenChange(false);
      onRemoved();
    } catch (error: any) {
      console.error('Error removing student:', error);
      toast({
        title: t("error"),
        description: t("errorRemovingStudent"),
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("removeStudentFromClass")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmRemoveStudent")} <strong>{studentName}</strong>?
            <br />
            <br />
            {t("studentWillLoseAccess")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isRemoving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRemoving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("removing")}
              </>
            ) : (
              t("removeStudent")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
