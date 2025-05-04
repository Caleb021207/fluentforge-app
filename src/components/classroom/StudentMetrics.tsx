import React from 'react';
import { useLocalization } from "@/hooks/useLocalization";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface StudentMetricsProps {
  metrics: {
    text_practice_calls: number;
    premium_voice_calls: number;
    last_activity: string | null;
  };
}

const StudentMetrics = ({ metrics }: StudentMetricsProps) => {
  const { t } = useLocalization();
  
  return (
    <div className="mt-6 space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold">{t("yourProgress")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="font-medium">{CLASSROOM_TEXT.PRACTICE_CALLS}:</span>{' '}
          {metrics.text_practice_calls} ({CLASSROOM_TEXT.PRACTICE_CALLS_SHORT})
        </div>
        <div>
          <span className="font-medium">{CLASSROOM_TEXT.VOICE_PRACTICE_CALLS}:</span>{' '}
          {metrics.premium_voice_calls} ({CLASSROOM_TEXT.VOICE_PRACTICE_CALLS_SHORT})
        </div>
        {metrics.last_activity && (
          <div>
            <span className="font-medium">{CLASSROOM_TEXT.LAST_ACTIVITY}:</span>{' '}
            {new Date(metrics.last_activity).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMetrics;
