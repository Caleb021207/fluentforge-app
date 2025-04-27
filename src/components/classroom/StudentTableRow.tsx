
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { StudentMetrics } from '@/components/classroom/types/studentTypes';
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface StudentTableRowProps {
  student: StudentMetrics;
}

export const StudentTableRow = ({ student }: StudentTableRowProps) => {
  // Calculate total practice calls
  const totalPracticeCalls = student.text_practice_calls + student.premium_voice_calls;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {student.student_name || student.student_email || CLASSROOM_TEXT.UNNAMED}
      </TableCell>
      <TableCell>{student.certification_attempts}</TableCell>
      <TableCell>
        {student.highest_certification_score > 0 
          ? `${Math.round(student.highest_certification_score)}%` 
          : '-'}
      </TableCell>
      <TableCell>{totalPracticeCalls}</TableCell>
      <TableCell>{student.premium_voice_sessions}</TableCell>
      <TableCell>{Math.round(student.premium_voice_minutes_used)} min</TableCell>
      <TableCell>
        {student.last_activity 
          ? new Date(student.last_activity).toLocaleDateString() 
          : '-'}
      </TableCell>
    </TableRow>
  );
};
