
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";

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
  
  // Calculate total practice calls
  const totalPracticeCalls = metrics.text_practice_calls + metrics.premium_voice_calls;
  
  // Display minutes used for teachers, minutes remaining for students
  const voiceMinutesDisplay = isTeacher ? 
    `${Math.round(metrics.premium_voice_minutes_used)} min used` :
    `${Math.round(metrics.premium_voice_minutes_remaining)} min remaining`;
  
  return (
    <div className="mt-6 space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold">{t("yourProgress")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <span className="font-medium">{t("practiceCalls")}:</span>{' '}
          {totalPracticeCalls}
        </div>
        <div>
          <span className="font-medium">{t("premiumVoiceSessions")}:</span>{' '}
          {metrics.premium_voice_sessions}
        </div>
        <div>
          <span className="font-medium">{t("premiumVoiceMinutes")}:</span>{' '}
          {voiceMinutesDisplay}
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
