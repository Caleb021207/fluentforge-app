
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { StudentMetrics } from '../types/studentTypes';
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
  );
};
