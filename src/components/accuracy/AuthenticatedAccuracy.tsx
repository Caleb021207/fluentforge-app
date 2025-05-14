
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LanguageMetrics } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useLocalization } from "@/context/LocalizationContext";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AccuracyChart from "./AccuracyChart";
import AccuracyOverview from "./AccuracyOverview";
import AccuracyRecommendations from "./AccuracyRecommendations";
import { useLanguageAnalysis } from "@/hooks/useLanguageAnalysis";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

const AuthenticatedAccuracy = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metricsHistory, setMetricsHistory] = useState<(LanguageMetrics & { timestamp: number })[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<LanguageMetrics | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();
  const { isOffline } = useConnectionStatus();
  const { isAnalyzing, analyzeConversation } = useLanguageAnalysis();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAccuracyData();
    }
  }, [user]);

  const fetchAccuracyData = async () => {
    if (!user || isOffline) {
      if (isOffline) {
        setFetchError(t("offlineDataMayNotBeUpToDate"));
      }
      return;
    }

    try {
      setIsRefreshing(true);
      
      // Query the student_language_metrics table
      const { data: metricsData, error: metricsError } = await supabase
        .from('student_language_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (metricsError) {
        throw metricsError;
      }

      if (!metricsData || metricsData.length === 0) {
        setFetchError(t("noAccuracyDataYet"));
        setIsRefreshing(false);
        return;
      }

      // Process metrics data
      const formattedMetrics = metricsData.map(metric => ({
        grammarAccuracy: metric.grammar_accuracy || 0,
        conversationComplexity: metric.conversation_complexity || 0,
        messageCount: metric.message_count || 0,
        vocabularyDiversity: metric.vocabulary_diversity,
        pronunciationAccuracy: metric.pronunciation_accuracy || 0,
        timestamp: new Date(metric.created_at).getTime(),
        session_id: metric.session_id
      }));

      setMetricsHistory(formattedMetrics);
      if (formattedMetrics.length > 0) {
        setLatestMetrics(formattedMetrics[0]);
      }
      setFetchError(null);

    } catch (error) {
      console.error("Error fetching accuracy data:", error);
      setFetchError(t("errorFetchingAccuracyData"));
      
      toast({
        title: t("error"),
        description: t("errorFetchingAccuracyData"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("accuracyMetrics")}</h1>
          <p className="text-muted-foreground">{t("accuracyMetricsDescription")}</p>
        </div>
        <Button 
          onClick={fetchAccuracyData} 
          disabled={isRefreshing || isAnalyzing} 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing || isAnalyzing ? 'animate-spin' : ''}`} />
          {isRefreshing || isAnalyzing ? t("analyzing") : t("refresh")}
        </Button>
      </div>

      {fetchError && (
        <Alert variant={isOffline ? "warning" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {!latestMetrics && !fetchError && !isRefreshing && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p>{t("noAccuracyDataYet")}</p>
            <p className="text-muted-foreground mt-2">{t("practiceMoreToSeeMetrics")}</p>
          </CardContent>
        </Card>
      )}

      {latestMetrics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="trends">{t("trends")}</TabsTrigger>
            <TabsTrigger value="recommendations">{t("recommendations")}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <AccuracyOverview metrics={latestMetrics} />
          </TabsContent>
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("progressOverTime")}</CardTitle>
                <CardDescription>{t("accuracyTrendsDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <AccuracyChart metricsHistory={metricsHistory} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recommendations" className="space-y-4">
            <AccuracyRecommendations metrics={latestMetrics} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AuthenticatedAccuracy;
