import React from 'react';
import { useLocalization } from "@/context/LocalizationContext";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getACTFLLevelFromScore, getACTFLBadgeVariant } from "@/utils/actflLevelMapping";

interface StudentMetricsProps {
  metrics: {
    text_practice_calls: number;
    premium_voice_calls: number;
    last_activity: string | null;
    avg_grammar_accuracy?: number;
    avg_conversation_complexity?: number;
    language_metrics_count?: number;
  };
}

const StudentMetrics = ({ metrics }: StudentMetricsProps) => {
  const { t } = useLocalization();
  
  return (
    <div className="mt-6 space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold text-foreground">{t("yourProgress")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="font-medium text-foreground">{CLASSROOM_TEXT.PRACTICE_CALLS}:</span>{' '}
          <span className="text-foreground">{metrics.text_practice_calls} ({CLASSROOM_TEXT.PRACTICE_CALLS_SHORT})</span>
        </div>
        <div>
          <span className="font-medium text-foreground">{CLASSROOM_TEXT.VOICE_PRACTICE_CALLS}:</span>{' '}
          <span className="text-foreground">{metrics.premium_voice_calls} ({CLASSROOM_TEXT.VOICE_PRACTICE_CALLS_SHORT})</span>
        </div>
        {metrics.last_activity && (
          <div>
            <span className="font-medium text-foreground">{CLASSROOM_TEXT.LAST_ACTIVITY}:</span>{' '}
            <span className="text-foreground">{new Date(metrics.last_activity).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      
      {/* Display language metrics if they exist */}
      {metrics.language_metrics_count && metrics.language_metrics_count > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">{t("languageMetrics")}</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t("grammarAccuracy")}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium">{Math.round(metrics.avg_grammar_accuracy || 0)}%</span>
                  <Badge 
                    className="ml-2" 
                    variant={getACTFLBadgeVariant(getACTFLLevelFromScore(metrics.avg_grammar_accuracy || 0))}
                  >
                    {getACTFLLevelFromScore(metrics.avg_grammar_accuracy || 0)}
                  </Badge>
                </div>
              </div>
              <Progress value={metrics.avg_grammar_accuracy || 0} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t("conversationComplexity")}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium">{Math.round(metrics.avg_conversation_complexity || 0)}%</span>
                  <Badge 
                    className="ml-2" 
                    variant={getACTFLBadgeVariant(getACTFLLevelFromScore(metrics.avg_conversation_complexity || 0))}
                  >
                    {getACTFLLevelFromScore(metrics.avg_conversation_complexity || 0)}
                  </Badge>
                </div>
              </div>
              <Progress value={metrics.avg_conversation_complexity || 0} className="h-2" />
            </div>
            
            <div className="text-xs text-muted-foreground">
              {t("basedOnConversations", { count: String(metrics.language_metrics_count) })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMetrics;
