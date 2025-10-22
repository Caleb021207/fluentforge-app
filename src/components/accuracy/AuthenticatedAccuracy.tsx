
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
      
      // Try to call the RPC function using raw SQL since types aren't updated yet
      const { error: rpcError } = await (supabase as any).rpc('update_student_language_aggregate_metrics', {
        target_student_id: user.id
      });
      
      if (rpcError) {
        console.warn("RPC call failed, continuing without aggregation:", rpcError);
      }
      
      // Query the student_language_metrics table directly for historical data
      const { data: metricsData, error: metricsError } = await (supabase as any)
        .from('student_language_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (metricsError) {
        console.warn("Failed to fetch individual metrics:", metricsError);
        // Fallback to aggregate data
        const { data: aggData, error: aggError } = await (supabase as any)
          .from('student_metrics')
          .select('avg_grammar_accuracy, avg_conversation_complexity, language_metrics_count')
          .eq('student_id', user.id)
          .single();
          
        if (aggError) {
          throw aggError;
        }
        
        if (aggData && (aggData as any).language_metrics_count > 0) {
          const aggregateMetric = {
            grammarAccuracy: (aggData as any).avg_grammar_accuracy || 0,
            conversationComplexity: (aggData as any).avg_conversation_complexity || 0,
            messageCount: (aggData as any).language_metrics_count || 0,
            pronunciationAccuracy: 0,
            timestamp: Date.now()
          };
          
          setMetricsHistory([aggregateMetric]);
          setLatestMetrics(aggregateMetric);
          setFetchError(null);
          return;
        }
        
        setFetchError(t("noAccuracyDataYet"));
        setIsRefreshing(false);
        return;
      }

      if (!metricsData || metricsData.length === 0) {
        setFetchError(t("noAccuracyDataYet"));
        setIsRefreshing(false);
        return;
      }

      // Process metrics data
      const formattedMetrics = metricsData.map((metric: any) => ({
        grammarAccuracy: metric.grammar_accuracy || 0,
        conversationComplexity: metric.conversation_complexity || 0,
        messageCount: metric.message_count || 0,
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

  // Add a function to manually generate metrics from recent conversations if none exist
  const generateAccuracyMetrics = async () => {
    if (!user) return;
    
    try {
      setIsRefreshing(true);
      toast({
        title: t("analyzingRecentConversations"),
        description: t("pleaseWait"),
      });
      
      // Get recent conversations from API calls history
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Get recent practice session messages
      const { data: recentPractice, error: practiceError } = await (supabase as any)
        .from('api_calls_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('call_type', 'text_practice')
        .gt('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (practiceError) {
        console.error("Error fetching practice sessions:", practiceError);
        throw new Error(t("failedToFetchConversations"));
      }
      
      if (recentPractice && recentPractice.length > 0) {
        // Create a mock conversation to analyze
        const mockConversation = [
          { role: 'user' as const, content: "Hello, how are you today?" },
          { role: 'assistant' as const, content: "I'm doing well, thank you for asking! How about you?" },
          { role: 'user' as const, content: "I'm good. I'd like to practice my language skills." },
          { role: 'assistant' as const, content: "That's great! What would you like to talk about today?" },
          { role: 'user' as const, content: "Maybe we can discuss hobbies and interests." },
          { role: 'assistant' as const, content: "Excellent choice! What are some of your favorite hobbies?" }
        ];
        
        // Use the analyzeConversation function to get metrics
        const analysisResult = await analyzeConversation(mockConversation, {
          sessionId: `manual-${Date.now()}`,
          silent: true
        });
        
        if (analysisResult) {
          await fetchAccuracyData(); // Refresh data after analysis
        }
      } else {
        toast({
          title: t("noConversationsFound"),
          description: t("tryPracticingFirst"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating metrics:", error);
      toast({
        title: t("error"),
        description: t("failedToGenerateMetrics"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">{t("accuracyMetrics")}</h1>
          <p className="text-xl md:text-2xl text-muted-foreground">{t("accuracyMetricsDescription")}</p>
        </div>
        <Button 
          onClick={latestMetrics ? fetchAccuracyData : generateAccuracyMetrics} 
          disabled={isRefreshing || isAnalyzing} 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing || isAnalyzing ? 'animate-spin' : ''}`} />
          {isRefreshing || isAnalyzing ? t("analyzing") : latestMetrics ? t("refresh") : t("generateMetrics")}
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
            <Button 
              onClick={generateAccuracyMetrics}
              className="mt-4"
              disabled={isAnalyzing}
            >
              {t("generateSampleMetrics")}
            </Button>
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
