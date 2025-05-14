
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LanguageMetrics } from "@/types/chat";
import { useLocalization } from "@/context/LocalizationContext";

interface AccuracyOverviewProps {
  metrics: LanguageMetrics;
}

const AccuracyOverview: React.FC<AccuracyOverviewProps> = ({ metrics }) => {
  const { t } = useLocalization();

  // Helper function to determine CEFR level based on score
  const getCEFRLevel = (score: number) => {
    if (score < 30) return 'A1';
    if (score < 50) return 'A2';
    if (score < 65) return 'B1';
    if (score < 80) return 'B2';
    if (score < 95) return 'C1';
    return 'C2';
  };

  // Helper function to get badge variant based on CEFR level
  const getBadgeVariant = (level: string) => {
    switch(level) {
      case 'A1': return 'outline';
      case 'A2': return 'secondary';
      case 'B1': return 'default';
      case 'B2': return 'default';
      case 'C1': return 'secondary';
      case 'C2': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">{t("grammarAccuracy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{Math.round(metrics.grammarAccuracy)}%</span>
              <Badge variant={getBadgeVariant(getCEFRLevel(metrics.grammarAccuracy))}>
                {getCEFRLevel(metrics.grammarAccuracy)}
              </Badge>
            </div>
            <Progress value={metrics.grammarAccuracy} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {t("grammarAccuracyDescription")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">{t("conversationComplexity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{Math.round(metrics.conversationComplexity)}%</span>
              <Badge variant={getBadgeVariant(getCEFRLevel(metrics.conversationComplexity))}>
                {getCEFRLevel(metrics.conversationComplexity)}
              </Badge>
            </div>
            <Progress value={metrics.conversationComplexity} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {t("conversationComplexityDescription")}
            </p>
          </div>
        </CardContent>
      </Card>

      {metrics.vocabularyDiversity !== undefined && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">{t("vocabularyDiversity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{Math.round(metrics.vocabularyDiversity)}%</span>
                <Badge variant={getBadgeVariant(getCEFRLevel(metrics.vocabularyDiversity))}>
                  {getCEFRLevel(metrics.vocabularyDiversity)}
                </Badge>
              </div>
              <Progress value={metrics.vocabularyDiversity} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {t("vocabularyDiversityDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">{t("overallAccuracy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Calculate overall score as average of available metrics */}
            {(() => {
              const values = [
                metrics.grammarAccuracy,
                metrics.conversationComplexity,
                ...(metrics.vocabularyDiversity !== undefined ? [metrics.vocabularyDiversity] : [])
              ];
              const overallScore = values.reduce((a, b) => a + b, 0) / values.length;
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{Math.round(overallScore)}%</span>
                    <Badge variant={getBadgeVariant(getCEFRLevel(overallScore))}>
                      {getCEFRLevel(overallScore)}
                    </Badge>
                  </div>
                  <Progress value={overallScore} className="h-2" />
                </>
              );
            })()}
            <p className="text-sm text-muted-foreground">
              {t("overallAccuracyDescription")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2 text-xs text-muted-foreground mt-2">
        {t("basedOnMessagesCount", { count: String(metrics.messageCount) })}
      </div>
    </div>
  );
};

export default AccuracyOverview;
