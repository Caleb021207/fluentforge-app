
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
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .eq('class_id', classId);

      if (enrollmentError) {
        console.error("Error fetching enrollments:", enrollmentError);
        throw enrollmentError;
      }

      if (!enrollments?.length) {
        setStudents([]);
        setIsLoading(false);
        return;
      }

      const studentIds = enrollments.map(e => e.student_id).filter(Boolean) as string[];

      const { data: metricsData, error: metricsError } = await supabase
        .from('student_metrics')
        .select('*')
        .in('student_id', studentIds);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', studentIds);

      if (metricsError) console.error("Error fetching student metrics:", metricsError);
      if (profilesError) console.error("Error fetching profiles:", profilesError);

      const metricsMap = new Map((metricsData || []).map(m => [m.student_id, m]));
      const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));

      const transformedData: StudentMetrics[] = studentIds.map(studentId => {
        const metrics = metricsMap.get(studentId);
        const profile = profilesMap.get(studentId);
        
        return {
          student_id: studentId,
          student_name: profile?.display_name || 'Unknown Student',
          student_email: profile?.email || null,
          text_practice_calls: metrics?.text_practice_calls || 0,
          premium_voice_calls: metrics?.premium_voice_calls || 0,
          premium_voice_sessions: 0,
          premium_voice_minutes_used: 0,
          premium_voice_minutes_remaining: 0,
          certification_attempts: 0,
          highest_certification_score: 0,
          completed_lessons: 0,
          total_lessons: 0,
          last_activity: metrics?.last_activity || null,
          avg_grammar_accuracy: metrics?.avg_grammar_accuracy || 0,
          avg_conversation_complexity: metrics?.avg_conversation_complexity || 0,
          avg_pronunciation_accuracy: 0,
          language_metrics_count: metrics?.language_metrics_count || 0,
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
