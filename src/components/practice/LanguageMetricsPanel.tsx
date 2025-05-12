
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BarChart } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { LanguageMetrics } from "@/types/chat";

interface LanguageMetricsPanelProps {
  metrics: LanguageMetrics | null;
  isLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onAnalyze: () => void;
}

const LanguageMetricsPanel: React.FC<LanguageMetricsPanelProps> = ({
  metrics,
  isLoading,
  isExpanded,
  onToggle,
  onAnalyze
}) => {
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

  const renderToggleButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-1"
    >
      <BarChart className="h-4 w-4" />
      {isExpanded ? t("hideMetrics") : t("viewLanguageMetrics")}
      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </Button>
  );

  if (!isExpanded) {
    return (
      <div className="flex justify-end my-2">
        {renderToggleButton()}
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md">{t("languageMetrics")}</CardTitle>
        {renderToggleButton()}
      </CardHeader>
      <CardContent>
        {!metrics && !isLoading && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">{t("noLanguageDataYet")}</p>
            <Button onClick={onAnalyze} disabled={isLoading}>
              {isLoading ? t("analyzing") : t("analyzeConversation")}
            </Button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">{t("analyzingConversation")}</span>
          </div>
        )}
        
        {metrics && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t("grammarAccuracy")}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium">{Math.round(metrics.grammarAccuracy)}%</span>
                  <Badge 
                    className="ml-2" 
                    variant={getBadgeVariant(getCEFRLevel(metrics.grammarAccuracy))}
                  >
                    {getCEFRLevel(metrics.grammarAccuracy)}
                  </Badge>
                </div>
              </div>
              <Progress value={metrics.grammarAccuracy} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{t("conversationComplexity")}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium">{Math.round(metrics.conversationComplexity)}%</span>
                  <Badge 
                    className="ml-2" 
                    variant={getBadgeVariant(getCEFRLevel(metrics.conversationComplexity))}
                  >
                    {getCEFRLevel(metrics.conversationComplexity)}
                  </Badge>
                </div>
              </div>
              <Progress value={metrics.conversationComplexity} className="h-2" />
            </div>
            
            {metrics.vocabularyDiversity && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{t("vocabularyDiversity")}</span>
                  <span className="text-sm font-medium">{Math.round(metrics.vocabularyDiversity)}%</span>
                </div>
                <Progress value={metrics.vocabularyDiversity} className="h-2" />
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {t("basedOnMessagesCount", { count: String(metrics.messageCount) })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguageMetricsPanel;
