
import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { useLocalization } from "@/context/LocalizationContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { StudentMetrics } from '@/components/classroom/types/studentTypes';
import { RemoveStudentDialog } from './RemoveStudentDialog';

interface StudentTableRowProps {
  student: StudentMetrics;
  classId?: string;
  onRemoved?: () => void;
}

export const StudentTableRow: React.FC<StudentTableRowProps> = ({ student, classId, onRemoved }) => {
  const { t } = useLocalization();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Format date if available
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("never");
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to determine CEFR level based on score
  const getCEFRLevel = (score: number) => {
    if (score < 30) return 'A1';
    if (score < 50) return 'A2';
    if (score < 65) return 'B1';
    if (score < 80) return 'B2';
    if (score < 95) return 'C1';
    return 'C2';
  };

  // Helper function to get badge color based on CEFR level
  const getBadgeVariant = (level: string) => {
    switch(level) {
      case 'A1': return 'outline';
      case 'A2': return 'secondary';
      case 'B1': return 'default';
      case 'B2': return 'default';
      case 'C1': return 'secondary';
      case 'C2': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{student.student_name || t("anonymous")}</div>
          <div className="text-sm text-muted-foreground">{student.student_email}</div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {student.certification_attempts || 0}
      </TableCell>
      <TableCell className="text-center">
        {student.highest_certification_score > 0 
          ? `${Math.round(student.highest_certification_score)}%` 
          : '-'}
      </TableCell>
      <TableCell>
        {(student.avg_grammar_accuracy && student.avg_grammar_accuracy > 0) ? (
          <div className="flex items-center gap-2">
            {Math.round(student.avg_grammar_accuracy)}%
            <Badge variant={getBadgeVariant(getCEFRLevel(student.avg_grammar_accuracy))}>
              {getCEFRLevel(student.avg_grammar_accuracy)}
            </Badge>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{t("noData")}</span>
        )}
      </TableCell>
      <TableCell>
        {(student.avg_conversation_complexity && student.avg_conversation_complexity > 0) ? (
          <div className="flex items-center gap-2">
            {Math.round(student.avg_conversation_complexity)}%
            <Badge variant={getBadgeVariant(getCEFRLevel(student.avg_conversation_complexity))}>
              {getCEFRLevel(student.avg_conversation_complexity)}
            </Badge>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{t("noData")}</span>
        )}
      </TableCell>
      <TableCell>
        {(student.avg_pronunciation_accuracy && student.avg_pronunciation_accuracy > 0) ? (
          <div className="flex items-center gap-2">
            {Math.round(student.avg_pronunciation_accuracy)}%
            <Badge variant={getBadgeVariant(getCEFRLevel(student.avg_pronunciation_accuracy))}>
              {getCEFRLevel(student.avg_pronunciation_accuracy)}
            </Badge>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{t("noData")}</span>
        )}
      </TableCell>
      <TableCell>
        {formatDate(student.last_activity)}
      </TableCell>
      {classId && onRemoved && (
        <TableCell className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRemoveDialog(true)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {student.student_id && (
            <RemoveStudentDialog
              open={showRemoveDialog}
              onOpenChange={setShowRemoveDialog}
              studentId={student.student_id}
              studentName={student.student_name || 'Unknown Student'}
              classId={classId}
              onRemoved={onRemoved}
            />
          )}
        </TableCell>
      )}
    </TableRow>
  );
};
