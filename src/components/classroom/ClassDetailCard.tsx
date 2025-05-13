
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClassData } from '@/types/classroom';

interface ClassDetailCardProps {
  classData: ClassData;
  isTeacher: boolean;
  translateFn: (key: string, replacements?: Record<string, string>) => string;
  onViewStudents: () => void;
  classCodeLabel: string;
  createdLabel: string;
}

const ClassDetailCard: React.FC<ClassDetailCardProps> = ({
  classData,
  isTeacher,
  translateFn,
  onViewStudents,
  classCodeLabel,
  createdLabel
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">{classData.class_name}</CardTitle>
        <CardDescription>
          {isTeacher 
            ? translateFn("studentsEnrolled", { count: String(classData.student_count) }) 
            : translateFn("teacher") + ": " + (classData.teacher_name || translateFn("unnamed"))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">{classCodeLabel}</p>
            <p className="text-lg font-mono bg-muted p-2 rounded">{classData.code}</p>
          </div>
          <div>
            <p className="text-sm font-medium">{createdLabel}</p>
            <p>{classData.created_at}</p>
          </div>
        </div>

        {isTeacher && (
          <div className="mt-6">
            <Button 
              onClick={onViewStudents} 
              className="w-full sm:w-auto"
            >
              {translateFn("viewStudents") || "View Students"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassDetailCard;
