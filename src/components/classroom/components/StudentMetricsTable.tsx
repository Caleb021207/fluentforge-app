
import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
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
  classId?: string;
  onStudentRemoved?: () => void;
}

export const StudentMetricsTable = ({
  students,
  sortField,
  sortDirection,
  onSort,
  classId,
  onStudentRemoved
}: StudentMetricsTableProps) => {
  const { t } = useLocalization();
  
  return (
    <div className="max-h-[600px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
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
              field="avg_pronunciation_accuracy"
              label={t("pronunciationAccuracy")}
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
            {classId && onStudentRemoved && (
              <TableHead className="text-center">{t("actions")}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <StudentTableRow 
              key={student.student_id || index} 
              student={student}
              classId={classId}
              onRemoved={onStudentRemoved}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
