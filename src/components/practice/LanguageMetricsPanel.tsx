
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Loader2 } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

interface LanguageMetricsPanelProps {
  metrics: any | null;
  isLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onAnalyze: () => void;
  hasAnalyzed?: boolean;
}

const LanguageMetricsPanel: React.FC<LanguageMetricsPanelProps> = ({
  metrics,
  isLoading,
  isExpanded,
  onToggle,
  onAnalyze,
  hasAnalyzed
}) => {
  const { t } = useLocalization();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("conversationAnalysis")}
          </CardTitle>
          <Button
            onClick={onAnalyze}
            disabled={isLoading || hasAnalyzed}
            size="sm"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("analyzing")}
              </>
            ) : (
              t("analyzeConversation")
            )}
          </Button>
        </div>
      </CardHeader>
      
      {metrics && isExpanded && (
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("grammarAccuracy")}</p>
              <p className="text-2xl font-bold">{metrics.grammarAccuracy}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("complexity")}</p>
              <p className="text-2xl font-bold">{metrics.conversationComplexity}%</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default LanguageMetricsPanel;
