
import React, { useState, useEffect } from 'react';
import { useLocalization } from "@/context/LocalizationContext";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronUp, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StudentMetrics {
  student_id: string | null;
  student_name: string | null;
  student_email: string | null;
  voice_chat_sessions: number | null;
  certification_attempts: number | null;
  avg_certification_score: number | null;
  completed_lessons: number | null;
  total_lessons: number | null;
  last_lesson_progress: string | null;
}

interface ClassStudentsListProps {
  classId: string;
  className: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClassStudentsList = ({ classId, className, open, onOpenChange }: ClassStudentsListProps) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [students, setStudents] = React.useState<StudentMetrics[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortField, setSortField] = React.useState<keyof StudentMetrics>('student_name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  console.log('ClassStudentsList rendered:', { classId, open, studentsCount: students.length });

  useEffect(() => {
    const fetchStudents = async () => {
      if (!open || !classId) return;
      
      setIsLoading(true);
      console.log('Fetching students for classroom:', classId);

      try {
        const { data, error } = await supabase
          .from('class_student_metrics')
          .select('*')
          .eq('classroom_id', classId);

        console.log('Student data fetch result:', { data, error });

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
  }, [classId, open, toast, t]);

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
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 inline ml-1" /> : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  // Sort students based on current sort field and direction
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {className} - {t("students")}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center">{t("loading")}</div>
        ) : sortedStudents.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">{t("noStudentsInClass")}</div>
        ) : (
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('student_name')}
                  >
                    {t("name")} <SortIcon field="student_name" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('completed_lessons')}
                  >
                    {t("completedLessons")} <SortIcon field="completed_lessons" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('certification_attempts')}
                  >
                    {t("certificationAttempts")} <SortIcon field="certification_attempts" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('avg_certification_score')}
                  >
                    {t("avgScore")} <SortIcon field="avg_certification_score" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('voice_chat_sessions')}
                  >
                    {t("voiceChatSessions")} <SortIcon field="voice_chat_sessions" />
                  </TableHead>
                  <TableHead>
                    {t("lastActivity")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student, index) => (
                  <TableRow key={student.student_id || index}>
                    <TableCell className="font-medium">
                      {student.student_name || student.student_email || t("unnamed")}
                    </TableCell>
                    <TableCell>{student.completed_lessons || 0} / {student.total_lessons || 0}</TableCell>
                    <TableCell>{student.certification_attempts || 0}</TableCell>
                    <TableCell>
                      {student.avg_certification_score 
                        ? `${Math.round(student.avg_certification_score)}%` 
                        : '-'}
                    </TableCell>
                    <TableCell>{student.voice_chat_sessions || 0}</TableCell>
                    <TableCell>
                      {student.last_lesson_progress 
                        ? new Date(student.last_lesson_progress).toLocaleDateString() 
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
