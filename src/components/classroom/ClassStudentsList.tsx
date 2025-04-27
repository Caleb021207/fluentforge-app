
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { StudentMetricsTable } from './components/StudentMetricsTable';
import { useSortableData } from './hooks/useSortableData';
import { StudentMetrics } from './types/studentTypes';

interface ClassStudentsListProps {
  classId: string;
  className: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClassStudentsList = ({ classId, className, open, onOpenChange }: ClassStudentsListProps) => {
  const { toast } = useToast();
  const [students, setStudents] = React.useState<StudentMetrics[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { sortedData, sortField, sortDirection, handleSort } = useSortableData(students);

  React.useEffect(() => {
    const fetchStudents = async () => {
      if (!open || !classId) return;
      
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('class_student_metrics')
          .select('*')
          .eq('classroom_id', classId);

        if (error) throw error;
        setStudents(data || []);
      } catch (error: any) {
        console.error('Error fetching students:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [classId, open, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>
            {className} - {CLASSROOM_TEXT.STUDENTS}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : students.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {CLASSROOM_TEXT.NO_STUDENTS_IN_CLASS}
          </div>
        ) : (
          <StudentMetricsTable
            students={sortedData}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClassStudentsList;
