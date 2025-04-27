
import React from 'react';
import { Table, TableHeader, TableBody } from "@/components/ui/table";
import { SortableTableHeader } from './SortableTableHeader';
import { StudentTableRow } from './StudentTableRow';
import { StudentMetrics, SortField, SortDirection } from '../types/studentTypes';
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface StudentMetricsTableProps {
  students: StudentMetrics[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const StudentMetricsTable = ({
  students,
  sortField,
  sortDirection,
  onSort,
}: StudentMetricsTableProps) => {
  return (
    <div className="max-h-[600px] overflow-auto">
      <Table>
        <TableHeader>
          <tr>
            <SortableTableHeader
              field="student_name"
              label={CLASSROOM_TEXT.NAME}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="certification_attempts"
              label={CLASSROOM_TEXT.CERTIFICATION_ATTEMPTS}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="highest_certification_score"
              label={CLASSROOM_TEXT.HIGH_SCORE}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="voice_chat_sessions"
              label={CLASSROOM_TEXT.VOICE_CHAT_SESSIONS}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="voice_chat_minutes"
              label={CLASSROOM_TEXT.VOICE_CHAT_MINUTES}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="text_inputs"
              label={CLASSROOM_TEXT.TEXT_INPUTS}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="text_outputs"
              label={CLASSROOM_TEXT.TEXT_OUTPUTS}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="premium_voice_sessions"
              label={CLASSROOM_TEXT.UNLIMITED_SESSIONS}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="premium_voice_minutes"
              label={CLASSROOM_TEXT.UNLIMITED_MINUTES}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="last_activity"
              label={CLASSROOM_TEXT.LAST_ACTIVITY}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
          </tr>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <StudentTableRow 
              key={student.student_id || index} 
              student={student} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

