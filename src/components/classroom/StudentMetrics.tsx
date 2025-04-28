import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface StudentMetricsProps {
  metrics: {
    text_practice_calls: number;
    premium_voice_calls: number;
    premium_voice_sessions: number;
    premium_voice_minutes_used: number;
    premium_voice_minutes_remaining: number;
    certification_attempts: number;
    highest_certification_score: number;
    last_activity: string | null;
  };
}

const StudentMetrics = ({ metrics }: StudentMetricsProps) => {
  const { t } = useLocalization();
  const { isTeacher } = useTeacherStatus();
  
  // Calculate and format minutes display
  const formatMinutes = () => {
    const usedMinutes = Math.min(Math.round(metrics.premium_voice_minutes_used || 0), 10);
    const remainingMinutes = Math.max(0, 10 - usedMinutes);
    return isTeacher 
      ? `${usedMinutes} / 10 min used`
      : `${remainingMinutes} min remaining`;
  };
  
  return (
    <div className="mt-6 space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold">{t("yourProgress")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="font-medium">{CLASSROOM_TEXT.CERTIFICATION_ATTEMPTS}:</span>{' '}
          {metrics.certification_attempts}
        </div>
        {metrics.highest_certification_score > 0 && (
          <div>
            <span className="font-medium">{CLASSROOM_TEXT.HIGH_SCORE}:</span>{' '}
            {metrics.highest_certification_score}%
          </div>
        )}
        <div>
          <span className="font-medium">{CLASSROOM_TEXT.PRACTICE_CALLS}:</span>{' '}
          {metrics.text_practice_calls}
        </div>
        <div>
          <span className="font-medium">{CLASSROOM_TEXT.PREMIUM_VOICE_SESSIONS}:</span>{' '}
          {metrics.premium_voice_sessions}
        </div>
        <div>
          <span className="font-medium">{CLASSROOM_TEXT.PREMIUM_VOICE_MINUTES}:</span>{' '}
          {formatMinutes()}
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
