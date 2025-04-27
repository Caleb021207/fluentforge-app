
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ClassInfo from './ClassInfo';
import StudentMetrics from './StudentMetrics';
import { useClassData } from '@/hooks/useClassData';

const StudentClassView = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { classData, isLoading, error, refetchData } = useClassData();
  const [refreshing, setRefreshing] = useState(false);

  // Ensure metrics are refreshed when component mounts
  useEffect(() => {
    if (!isLoading && classData) {
      // Trigger metrics recalculation on mount
      handleRefresh(false);
    }
  }, [isLoading, classData]);

  const handleRefresh = async (showToast = true) => {
    setRefreshing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Refreshing metrics for user:", user.id);
      
      // Force recalculation of metrics
      const { error: recalcError } = await supabase.rpc(
        'recalculate_student_metrics',
        { target_student_id: user.id }
      );
      
      if (recalcError) {
        console.error("Error recalculating metrics:", recalcError);
        throw recalcError;
      }
      
      // Add a small delay to ensure DB updates are complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch updated data
      await refetchData();
      
      if (showToast) {
        toast({
          title: t("success"),
          description: t("metricsRefreshed"),
        });
      }
    } catch (error: any) {
      console.error("Error refreshing metrics:", error);
      if (showToast) {
        toast({
          title: t("error"),
          description: t("failedToRefreshMetrics"),
          variant: "destructive",
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!classData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{t("noClassJoined")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{classData.class_name}</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRefresh(true)} 
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {refreshing ? t("refreshing") : t("refresh")}
        </Button>
      </CardHeader>
      
      <ClassInfo
        className={classData.class_name}
        teacherName={classData.teacher_name}
        teacherEmail={classData.teacher_email}
        joinedAt={classData.joined_at}
        code={classData.code}
      />

      <CardContent>
        {classData.metrics ? (
          <StudentMetrics 
            metrics={{
              text_practice_calls: classData.metrics.text_practice_calls || 0,
              premium_voice_calls: classData.metrics.premium_voice_calls || 0,
              premium_voice_sessions: classData.metrics.premium_voice_sessions || 0,
              premium_voice_minutes_used: classData.metrics.premium_voice_minutes_used || 0,
              premium_voice_minutes_remaining: classData.metrics.premium_voice_minutes_remaining || 10,
              certification_attempts: classData.metrics.certification_attempts || 0,
              highest_certification_score: classData.metrics.highest_certification_score || 0,
              last_activity: classData.metrics.last_activity || null
            }} 
          />
        ) : (
          <p>{t("loadingMetrics")}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentClassView;
