
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faComments, faMicrophone, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { Progress } from "@/components/ui/progress";
import { LanguageMetrics } from "@/types/chat";
import { useLocalization } from "@/context/LocalizationContext";

const AccuracyOverview = ({ metrics }: { metrics: LanguageMetrics }) => {
  const { t } = useLocalization();
  
  const getScoreColor = (score: number | undefined): string => {
    if (score === undefined) return "bg-gray-500";
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getScoreColorClass = (score: number | undefined): string => {
    if (score === undefined) return "bg-gray-500";
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreDescription = (score: number | undefined, type: string): string => {
    if (score === undefined) return t("noDataAvailable");
    if (score >= 70) {
      return t(`excellent${type}`);
    } else if (score >= 40) {
      return t(`average${type}`);
    } else {
      return t(`needsImprovement${type}`);
    }
  };
  
  // Add pronunciation accuracy to the metrics cards
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("grammarAccuracy")}
          </CardTitle>
          <div className={`rounded-full p-1 ${getScoreColor(metrics.grammarAccuracy)}`}>
            <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.grammarAccuracy?.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {getScoreDescription(metrics.grammarAccuracy, "grammar")}
          </p>
          <Progress 
            value={metrics.grammarAccuracy} 
            className="mt-2"
            indicatorClassName={getScoreColorClass(metrics.grammarAccuracy)}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("conversationComplexity")}
          </CardTitle>
          <div className={`rounded-full p-1 ${getScoreColor(metrics.conversationComplexity)}`}>
            <FontAwesomeIcon icon={faComments} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.conversationComplexity?.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {getScoreDescription(metrics.conversationComplexity, "complexity")}
          </p>
          <Progress 
            value={metrics.conversationComplexity} 
            className="mt-2"
            indicatorClassName={getScoreColorClass(metrics.conversationComplexity)}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("pronunciationAccuracy")}
          </CardTitle>
          <div className={`rounded-full p-1 ${getScoreColor(metrics.pronunciationAccuracy || 0)}`}>
            <FontAwesomeIcon icon={faMicrophone} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(metrics.pronunciationAccuracy || 0).toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {getScoreDescription(metrics.pronunciationAccuracy || 0, "pronunciation")}
          </p>
          <Progress 
            value={metrics.pronunciationAccuracy || 0} 
            className="mt-2"
            indicatorClassName={getScoreColorClass(metrics.pronunciationAccuracy || 0)}
          />
        </CardContent>
      </Card>
      
      {metrics.vocabularyDiversity !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("vocabularyDiversity")}
            </CardTitle>
            <div className={`rounded-full p-1 ${getScoreColor(metrics.vocabularyDiversity)}`}>
              <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vocabularyDiversity?.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {getScoreDescription(metrics.vocabularyDiversity, "vocabulary")}
            </p>
            <Progress 
              value={metrics.vocabularyDiversity} 
              className="mt-2"
              indicatorClassName={getScoreColorClass(metrics.vocabularyDiversity)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccuracyOverview;
