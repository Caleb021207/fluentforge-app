import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface StudentMetrics {
  student_id: string | null;
  student_name: string | null;
  student_email: string | null;
  voice_chat_sessions: number;
  voice_chat_minutes: number;
  text_inputs: number;
  text_outputs: number;
  premium_voice_sessions: number;
  premium_voice_minutes: number;
  certification_attempts: number;
  highest_certification_score: number;
  completed_lessons: number;
  total_lessons: number;
  last_activity: string | null;
}

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
  const [sortField, setSortField] = React.useState<keyof StudentMetrics>('student_name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

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
          title: t("error"),
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

  const handleSort = (field: keyof StudentMetrics) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof StudentMetrics }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const sortedStudents = [...students].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    
    if (valA === null) return sortDirection === 'asc' ? 1 : -1;
    if (valB === null) return sortDirection === 'asc' ? -1 : 1;
    
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

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
          <div className="py-8 text-center text-muted-foreground">{CLASSROOM_TEXT.NO_STUDENTS_IN_CLASS}</div>
        ) : (
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('student_name')}
                  >
                    {CLASSROOM_TEXT.NAME} <SortIcon field="student_name" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('certification_attempts')}
                  >
                    {CLASSROOM_TEXT.CERTIFICATION_ATTEMPTS} <SortIcon field="certification_attempts" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('highest_certification_score')}
                  >
                    {CLASSROOM_TEXT.HIGH_SCORE} <SortIcon field="highest_certification_score" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('voice_chat_sessions')}
                  >
                    {CLASSROOM_TEXT.VOICE_CHAT_SESSIONS} <SortIcon field="voice_chat_sessions" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('voice_chat_minutes')}
                  >
                    {CLASSROOM_TEXT.VOICE_CHAT_MINUTES} <SortIcon field="voice_chat_minutes" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('text_inputs')}
                  >
                    {CLASSROOM_TEXT.TEXT_INPUTS} <SortIcon field="text_inputs" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('text_outputs')}
                  >
                    {CLASSROOM_TEXT.TEXT_OUTPUTS} <SortIcon field="text_outputs" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('premium_voice_sessions')}
                  >
                    {CLASSROOM_TEXT.UNLIMITED_SESSIONS} <SortIcon field="premium_voice_sessions" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('premium_voice_minutes')}
                  >
                    {CLASSROOM_TEXT.UNLIMITED_MINUTES} <SortIcon field="premium_voice_minutes" />
                  </TableHead>
                  <TableHead>
                    {CLASSROOM_TEXT.LAST_ACTIVITY}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student, index) => (
                  <TableRow key={student.student_id || index}>
                    <TableCell className="font-medium">
                      {student.student_name || student.student_email || CLASSROOM_TEXT.UNNAMED}
                    </TableCell>
                    <TableCell>{student.certification_attempts}</TableCell>
                    <TableCell>
                      {student.highest_certification_score > 0 
                        ? `${Math.round(student.highest_certification_score)}%` 
                        : '-'}
                    </TableCell>
                    <TableCell>{student.voice_chat_sessions}</TableCell>
                    <TableCell>{Math.round(student.voice_chat_minutes)} min</TableCell>
                    <TableCell>{student.text_inputs}</TableCell>
                    <TableCell>{student.text_outputs}</TableCell>
                    <TableCell>{student.premium_voice_sessions}</TableCell>
                    <TableCell>{Math.round(student.premium_voice_minutes)} min</TableCell>
                    <TableCell>
                      {student.last_activity 
                        ? new Date(student.last_activity).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClassStudentsList;
