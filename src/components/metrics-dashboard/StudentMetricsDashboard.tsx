
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import LanguageMetricsChart from '@/components/classroom/LanguageMetricsChart';
import { useLanguageAnalysis } from '@/hooks/useLanguageAnalysis';
import { useClassData } from '@/hooks/useClassData';

interface MetricsData {
  date: string;
  grammarAccuracy: number;
  conversationComplexity: number;
  timestamp: string;
}

const StudentMetricsDashboard = () => {
  const [metrics, setMetrics] = useState<MetricsData[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [grammarAccuracy, setGrammarAccuracy] = useState(0);
  const [conversationComplexity, setConversationComplexity] = useState(0);
  const [metricsCount, setMetricsCount] = useState(0);
  const { toast } = useToast();
  const { t } = useLocalization();
  const { analyzeConversation, isAnalyzing } = useLanguageAnalysis();
  const { classData } = useClassData();

  useEffect(() => {
    fetchUserMetrics();
  }, []);

  const fetchUserMetrics = async () => {
    try {
      setIsLoadingMetrics(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get user metrics
      const { data: studentData, error: studentError } = await supabase
        .from('student_metrics')
        .select('avg_grammar_accuracy, avg_conversation_complexity, language_metrics_count')
        .eq('student_id', user.id)
        .maybeSingle();

      if (studentError) throw studentError;
      
      if (studentData) {
        setGrammarAccuracy(studentData.avg_grammar_accuracy || 0);
        setConversationComplexity(studentData.avg_conversation_complexity || 0);
        setMetricsCount(studentData.language_metrics_count || 0);
      }

      // Get detailed metrics history
      const { data, error } = await supabase
        .from('student_language_metrics')
        .select('grammar_accuracy, conversation_complexity, created_at')
        .eq('user_id', user.id)
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
      console.error("Error fetching metrics:", err);
      toast({
        title: t("error"),
        description: t("failedToLoadMetrics"),
        variant: "destructive"
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleAnalyzeConversations = async () => {
    try {
      toast({
        title: t("inProgress"),
        description: t("analysingConversationHistory"),
      });
      
      // In a real implementation, this would call the function to analyze the user's conversations
      // For now, we'll just wait a bit and then refresh the metrics
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      fetchUserMetrics();
      
      toast({
        title: t("success"),
        description: t("analysisComplete"),
      });
    } catch (err: any) {
      console.error("Error triggering analysis:", err);
      toast({
        title: t("error"),
        description: t("failedToAnalyzeConversations"),
        variant: "destructive"
      });
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold">{t("yourLanguageMetrics")}</h2>
        {classData && (
          <div className="text-sm text-muted-foreground">
            {t("classroomName")}: {classData.class_name}
          </div>
        )}
        <Button 
          onClick={handleAnalyzeConversations}
          disabled={isAnalyzing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {t("analyzeConversations")}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("grammarAccuracy")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(grammarAccuracy)}%
            </div>
            <Badge className="mt-2">
              {getCEFRLevel(grammarAccuracy)}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("conversationComplexity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(conversationComplexity)}%
            </div>
            <Badge className="mt-2">
              {getCEFRLevel(conversationComplexity)}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("metricsAnalyzed")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metricsCount}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isLoadingMetrics ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : metrics.length > 0 ? (
        <LanguageMetricsChart 
          data={metrics} 
          title={t("yourProgressOverTime")}
        />
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">{t("noMetricsYet")}</h3>
            <p className="text-muted-foreground mb-6">{t("startPracticingToGenerateMetrics")}</p>
            <Button 
              onClick={handleAnalyzeConversations}
            >
              {t("analyzeConversations")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentMetricsDashboard;
