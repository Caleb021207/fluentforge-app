
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LanguageMetricsChart from './LanguageMetricsChart';
import { format } from 'date-fns';

interface StudentLanguageMetricsProps {
  studentId: string;
  classroomId?: string;
}

interface MetricsDataPoint {
  date: string;
  grammarAccuracy: number;
  conversationComplexity: number;
  timestamp: string; // Original timestamp for sorting
}

const StudentLanguageMetrics: React.FC<StudentLanguageMetricsProps> = ({ studentId, classroomId }) => {
  const [metrics, setMetrics] = useState<MetricsDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('student_language_metrics')
          .select('grammar_accuracy, conversation_complexity, created_at')
          .eq('user_id', studentId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedData: MetricsDataPoint[] = (data || []).map(item => ({
          // Convert to string for date formatting
          date: format(new Date(item.created_at), 'MM/dd'),
          // Parse as floats to ensure they're numbers
          grammarAccuracy: parseFloat(String(item.grammar_accuracy)),
          conversationComplexity: parseFloat(String(item.conversation_complexity)),
          timestamp: item.created_at
        }));

        setMetrics(formattedData);
      } catch (err: any) {
        console.error("Error fetching language metrics:", err);
        setError(err.message);
        toast({
          title: t("error"),
          description: t("failedToLoadMetrics"),
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchMetrics();
    }
  }, [studentId, classroomId, toast, t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <LanguageMetricsChart 
        data={metrics} 
        title={t("languageSkillsProgress")}
      />
    </div>
  );
};

export default StudentLanguageMetrics;
