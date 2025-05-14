
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useLanguageAnalysis } from "@/hooks/useLanguageAnalysis";
import LanguageMetricsChart from '@/components/classroom/LanguageMetricsChart';
import LanguageMetricsPanel from '@/components/practice/LanguageMetricsPanel';

interface MetricsData {
  date: string;
  grammarAccuracy: number;
  conversationComplexity: number;
  timestamp: string;
}

const StudentMetricsDashboard = () => {
  const [metrics, setMetrics] = useState<MetricsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  const { analyzeConversation, isAnalyzing, lastMetrics } = useLanguageAnalysis();

  useEffect(() => {
    fetchMetricsData();
  }, [dateRange]);

  const fetchMetricsData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Calculate date range filter
      let dateFilter;
      const now = new Date();
      
      switch (dateRange) {
        case '7days':
          dateFilter = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30days':
          dateFilter = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90days':
          dateFilter = new Date(now.setDate(now.getDate() - 90));
          break;
        case 'all':
          dateFilter = new Date(0); // Beginning of time
          break;
        default:
          dateFilter = new Date(now.setDate(now.getDate() - 30));
      }

      const { data, error } = await supabase
        .from('student_language_metrics')
        .select('grammar_accuracy, conversation_complexity, created_at')
        .eq('user_id', user.id)
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map(item => {
        const date = new Date(item.created_at);
        return {
          date: date.toLocaleDateString(),
          grammarAccuracy: parseFloat(String(item.grammar_accuracy)),
          conversationComplexity: parseFloat(String(item.conversation_complexity)),
          timestamp: item.created_at
        };
      });

      setMetrics(formattedData);
    } catch (err: any) {
      console.error("Error fetching language metrics:", err);
      toast({
        title: t("error"),
        description: t("failedToLoadMetrics"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeRecentConversations = async () => {
    // This would be implemented to trigger analysis of recent conversations
    // that haven't been analyzed yet
    toast({
      title: t("inProgress"),
      description: t("analyzingRecentConversations"),
    });
    
    // Placeholder for actual implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Refresh data after analysis
    fetchMetricsData();
    
    toast({
      title: t("success"),
      description: t("conversationsAnalyzed"),
    });
  };

  // Helper function to determine CEFR level based on score
  const getCEFRLevel = (score: number) => {
    if (score < 30) return 'A1';
    if (score < 50) return 'A2';
    if (score < 65) return 'B1';
    if (score < 80) return 'B2';
    if (score < 95) return 'C1';
    return 'C2';
  };

  // Calculate averages
  const calculateAverages = () => {
    if (metrics.length === 0) return { grammar: 0, complexity: 0 };
    
    const totals = metrics.reduce((acc, metric) => {
      return {
        grammar: acc.grammar + metric.grammarAccuracy,
        complexity: acc.complexity + metric.conversationComplexity
      };
    }, { grammar: 0, complexity: 0 });
    
    return {
      grammar: Math.round(totals.grammar / metrics.length),
      complexity: Math.round(totals.complexity / metrics.length)
    };
  };

  const averages = calculateAverages();
  
  const lastMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t("yourLanguageProgress")}</h2>
          <p className="text-muted-foreground">{t("trackYourMetricsOverTime")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("selectTimeframe")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t("last7Days")}</SelectItem>
              <SelectItem value="30days">{t("last30Days")}</SelectItem>
              <SelectItem value="90days">{t("last90Days")}</SelectItem>
              <SelectItem value="all">{t("allTime")}</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => fetchMetricsData()}
            disabled={isLoading}
          >
            {isLoading ? t("refreshing") : t("refresh")}
          </Button>
          <Button 
            onClick={analyzeRecentConversations}
            disabled={isLoading}
          >
            {t("analyzeRecent")}
          </Button>
        </div>
      </div>

      {metrics.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("grammarAccuracy")}</CardTitle>
                <CardDescription>
                  {t("grammarAccuracyDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {lastMetric ? Math.round(lastMetric.grammarAccuracy) : 0}%
                  </div>
                  <Badge className="text-sm">
                    {lastMetric ? getCEFRLevel(lastMetric.grammarAccuracy) : 'N/A'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {t("averageScore")}: {averages.grammar}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("conversationComplexity")}</CardTitle>
                <CardDescription>
                  {t("conversationComplexityDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {lastMetric ? Math.round(lastMetric.conversationComplexity) : 0}%
                  </div>
                  <Badge className="text-sm">
                    {lastMetric ? getCEFRLevel(lastMetric.conversationComplexity) : 'N/A'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {t("averageScore")}: {averages.complexity}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <LanguageMetricsChart 
              data={metrics} 
              title={t("progressOverTime")}
            />
          </div>
          
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowDetailsPanel(!showDetailsPanel)}
          >
            <BarChart className="h-4 w-4" />
            {showDetailsPanel ? t("hideDetailsPanel") : t("showDetailsPanel")}
          </Button>
          
          {showDetailsPanel && lastMetrics && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{t("detailedMetrics")}</CardTitle>
                <CardDescription>{t("basedOnMostRecentAnalysis")}</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(lastMetrics, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-6 text-center">
          <CardContent>
            <div className="py-12">
              <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">{t("noMetricsYet")}</h3>
              <p className="text-muted-foreground mb-6">{t("startPracticingToGenerateMetrics")}</p>
              <Button 
                onClick={analyzeRecentConversations}
              >
                {t("analyzeConversations")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentMetricsDashboard;
