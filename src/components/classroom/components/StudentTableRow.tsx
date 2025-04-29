
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { StudentMetrics } from '@/components/classroom/types/studentTypes';
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface StudentTableRowProps {
  student: StudentMetrics;
}

export const StudentTableRow = ({ student }: StudentTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {student.student_name || student.student_email || CLASSROOM_TEXT.UNNAMED}
      </TableCell>
      <TableCell>{student.text_practice_calls} (OpenAI)</TableCell>
      <TableCell>{student.premium_voice_calls} (AWS Polly)</TableCell>
      <TableCell>
        {student.last_activity 
          ? new Date(student.last_activity).toLocaleDateString() 
          : '-'}
      </TableCell>
    </TableRow>
  );
};
