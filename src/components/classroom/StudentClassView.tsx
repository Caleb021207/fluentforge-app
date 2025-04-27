
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { Loader2 } from "lucide-react";
import ClassInfo from './ClassInfo';
import StudentMetrics from './StudentMetrics';
import { useClassData } from '@/hooks/useClassData';

const StudentClassView = () => {
  const { t } = useLocalization();
  const { classData, isLoading, error } = useClassData();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!classData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{t("noClassJoined")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{classData.class_name}</CardTitle>
      </CardHeader>
      
      <ClassInfo
        className={classData.class_name}
        teacherName={classData.teacher_name}
        teacherEmail={classData.teacher_email}
        joinedAt={classData.joined_at}
        code={classData.code}
      />

      {classData.metrics && (
        <CardContent>
          <StudentMetrics metrics={classData.metrics} />
        </CardContent>
      )}
    </Card>
  );
};

export default StudentClassView;
