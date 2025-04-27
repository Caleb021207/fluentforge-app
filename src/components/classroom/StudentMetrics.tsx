
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface StudentMetricsProps {
  metrics: {
    voice_chat_sessions: number;
    voice_chat_minutes: number;
    text_inputs: number;
    text_outputs: number;
    premium_voice_sessions: number;
    premium_voice_minutes: number;
    certification_attempts: number;
    highest_certification_score: number;
    completed_lessons: number;
    total_lessons: number;
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
          <span className="font-medium">{t("completedLessons")}:</span>{' '}
          {metrics.completed_lessons} / {metrics.total_lessons}
        </div>
        <div>
          <span className="font-medium">{t("certificationAttempts")}:</span>{' '}
          {metrics.certification_attempts}
        </div>
        {metrics.highest_certification_score > 0 && (
          <div>
            <span className="font-medium">{t("highestScore")}:</span>{' '}
            {metrics.highest_certification_score}%
          </div>
        )}
        <div>
          <span className="font-medium">{t("textInputs")}:</span>{' '}
          {metrics.text_inputs}
        </div>
        <div>
          <span className="font-medium">{t("textOutputs")}:</span>{' '}
          {metrics.text_outputs}
        </div>
        <div>
          <span className="font-medium">{t("unlimitedSessions")}:</span>{' '}
          {metrics.premium_voice_sessions}
        </div>
        <div>
          <span className="font-medium">{t("unlimitedMinutes")}:</span>{' '}
          {Math.round(metrics.premium_voice_minutes)} min
        </div>
        {metrics.last_activity && (
          <div>
            <span className="font-medium">{t("lastActivity")}:</span>{' '}
            {new Date(metrics.last_activity).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMetrics;
