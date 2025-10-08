
import React from 'react';
import { Table, TableHeader, TableBody } from "@/components/ui/table";
import { SortableTableHeader } from './SortableTableHeader';
import { StudentTableRow } from './StudentTableRow';
import { StudentMetrics, SortField, SortDirection } from '@/components/classroom/types/studentTypes';
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { useLocalization } from "@/context/LocalizationContext";

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
  const { t } = useLocalization();
  
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
              label="Cert Attempts"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="highest_certification_score"
              label="Cert Score"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="avg_grammar_accuracy"
              label={t("grammarAccuracy")}
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              field="avg_conversation_complexity"
              label={t("conversationComplexity")}
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
