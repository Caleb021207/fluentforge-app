
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { StudentMetrics } from '@/components/classroom/types/studentTypes';
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface StudentTableRowProps {
  student: StudentMetrics;
}

export const StudentTableRow = ({ student }: StudentTableRowProps) => {
  // Format minutes with proper rounding and cap at 10 minutes
  const formatMinutes = (used: number, remaining: number) => {
    const usedMinutes = Math.min(Math.round(used), 10);
    const remainingMinutes = Math.max(0, Math.min(10 - usedMinutes, 10));
    return `${usedMinutes} / 10 min`;
  };

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
      <TableCell>{student.text_practice_calls}</TableCell>
      <TableCell>{student.premium_voice_sessions}</TableCell>
      <TableCell>
        {formatMinutes(
          student.premium_voice_minutes_used || 0,
          student.premium_voice_minutes_remaining || 10
        )}
      </TableCell>
      <TableCell>
        {student.last_activity 
          ? new Date(student.last_activity).toLocaleDateString() 
          : '-'}
      </TableCell>
    </TableRow>
  );
};
