
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { useLocalization } from '@/context/LocalizationContext';

interface StudentMetric {
  student_id: string;
  student_email: string;
  student_name: string | null;
  voice_chat_sessions: number;
  voice_chat_minutes: number;
  certification_attempts: number;
  avg_certification_score: number;
  completed_lessons: number;
  total_lessons: number;
  last_voice_chat: string | null;
  last_certification: string | null;
  last_lesson_progress: string | null;
}

interface StudentMetricsTableProps {
  metrics: StudentMetric[];
}

export function StudentMetricsTable({ metrics }: StudentMetricsTableProps) {
  const { t } = useLocalization();

  const formatDate = (date: string | null) => {
    if (!date) return t("never");
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("student")}</TableHead>
          <TableHead className="text-right">{t("voiceChatSessions")}</TableHead>
          <TableHead className="text-right">{t("voiceChatMinutes")}</TableHead>
          <TableHead className="text-right">{t("certificationAttempts")}</TableHead>
          <TableHead className="text-right">{t("averageScore")}</TableHead>
          <TableHead className="text-right">{t("completedLessons")}</TableHead>
          <TableHead>{t("lastActive")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {metrics.map((metric) => (
          <TableRow key={metric.student_id}>
            <TableCell>
              {metric.student_name || metric.student_email}
            </TableCell>
            <TableCell className="text-right">{metric.voice_chat_sessions}</TableCell>
            <TableCell className="text-right">{Math.round(metric.voice_chat_minutes)}</TableCell>
            <TableCell className="text-right">{metric.certification_attempts}</TableCell>
            <TableCell className="text-right">
              {metric.avg_certification_score ? `${Math.round(metric.avg_certification_score)}%` : '-'}
            </TableCell>
            <TableCell className="text-right">
              {metric.completed_lessons} / {metric.total_lessons}
            </TableCell>
            <TableCell>
              {formatDate(
                [metric.last_voice_chat, metric.last_certification, metric.last_lesson_progress]
                  .filter(Boolean)
                  .sort()
                  .reverse()[0]
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
