
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { StudentMetricsTable } from './components/StudentMetricsTable';
import { useSortableData } from './hooks/useSortableData';
import { StudentMetrics } from './types/studentTypes';
import { RefreshMetricsButton } from './components/RefreshMetricsButton';

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

  const fetchStudents = async () => {
    if (!open || !classId) return;
    
    setIsLoading(true);

    try {
      // Query student_metrics joined with classroom_memberships and profiles
      const { data: metricsData, error: metricsError } = await supabase
        .from('student_metrics')
        .select(`
          *,
          classroom_memberships!inner(classroom_id),
          profiles(display_name)
        `)
        .eq('classroom_memberships.classroom_id', classId);

      if (metricsError) {
        console.error("Error fetching student metrics:", metricsError);
        throw metricsError;
      }

      const transformedData: StudentMetrics[] = (metricsData || []).map((student: any) => {
        return {
          student_id: student.student_id || null,
          student_name: student.profiles?.display_name || 'Unknown Student',
          student_email: null,
          text_practice_calls: student.text_practice_calls || 0,
          premium_voice_calls: student.premium_voice_calls || 0,
          premium_voice_sessions: student.premium_voice_sessions || 0,
          premium_voice_minutes_used: student.premium_voice_minutes_used || 0,
          premium_voice_minutes_remaining: student.premium_voice_minutes_remaining || 0,
          certification_attempts: student.certification_attempts || 0,
          highest_certification_score: student.highest_certification_score || 0,
          completed_lessons: student.completed_lessons || 0,
          total_lessons: student.total_lessons || 0,
          last_activity: student.last_activity || null,
          avg_grammar_accuracy: student.avg_grammar_accuracy || 0,
          avg_conversation_complexity: student.avg_conversation_complexity || 0,
          avg_pronunciation_accuracy: student.avg_pronunciation_accuracy || 0,
          language_metrics_count: student.language_metrics_count || 0,
        };
      });

      setStudents(transformedData);
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

  React.useEffect(() => {
    fetchStudents();
  }, [classId, open, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {className} - {CLASSROOM_TEXT.STUDENTS}
            </DialogTitle>
            <RefreshMetricsButton 
              classId={classId} 
              onSuccess={fetchStudents} 
            />
          </div>
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
            classId={classId}
            onStudentRemoved={fetchStudents}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClassStudentsList;
