
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface ClassInfoProps {
  className: string;
  teacherName?: string;
  teacherEmail?: string;
  joinedAt: string;
  code: string;
}

const ClassInfo = ({ className, teacherName, teacherEmail, joinedAt, code }: ClassInfoProps) => {
  const { t } = useLocalization();
  
  return (
    <CardContent className="space-y-4">
      {(teacherName || teacherEmail) && (
        <div>
          <span className="font-medium">{t("teacher")}:</span>{' '}
          {teacherName || teacherEmail}
        </div>
      )}
      <div>
        <span className="font-medium">{t("joined")}:</span> {joinedAt}
      </div>
      <div>
        <span className="font-medium">{t("classCode")}:</span> {code}
      </div>
    </CardContent>
  );
};

export default ClassInfo;
