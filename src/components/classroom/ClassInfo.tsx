
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface ClassInfoProps {
  className: string;
  teacherName?: string;
  teacherEmail?: string;
  joinedAt: string;
  code: string;
}

const ClassInfo = ({ className, teacherName, teacherEmail, joinedAt, code }: ClassInfoProps) => {
  return (
    <CardContent className="space-y-4">
      {(teacherName || teacherEmail) && (
        <div>
          <span className="font-medium">{CLASSROOM_TEXT.TEACHER}:</span>{' '}
          {teacherName || teacherEmail}
        </div>
      )}
      <div>
        <span className="font-medium">{CLASSROOM_TEXT.JOINED}:</span> {joinedAt}
      </div>
      <div>
        <span className="font-medium">{CLASSROOM_TEXT.CLASS_CODE}:</span> {code}
      </div>
    </CardContent>
  );
};

export default ClassInfo;
