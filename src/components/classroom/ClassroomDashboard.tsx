
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClassroom } from '@/hooks/useClassroom';
import { CreateClassForm } from './CreateClassForm';
import { JoinClassForm } from './JoinClassForm';
import { StudentMetricsTable } from './StudentMetricsTable';
import { useLocalization } from '@/context/LocalizationContext';
import { Loader2 } from 'lucide-react';

export function ClassroomDashboard() {
  const { isTeacher, isLoading, classrooms, studentMetrics, createClassroom, joinClassroom } = useClassroom();
  const { t } = useLocalization();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-lingua-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTeacher ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("createNewClass")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateClassForm onCreate={createClassroom} />
              {classrooms.map(classroom => (
                <div key={classroom.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <h3 className="font-medium">{classroom.class_name}</h3>
                    <p className="text-sm text-gray-500">{t("classCode")}: {classroom.code}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {studentMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("studentProgress")}</CardTitle>
              </CardHeader>
              <CardContent>
                <StudentMetricsTable metrics={studentMetrics} />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("joinClass")}</CardTitle>
          </CardHeader>
          <CardContent>
            <JoinClassForm onJoin={joinClassroom} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
