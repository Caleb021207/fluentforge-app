
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ClassInfo from './ClassInfo';
import StudentMetrics from './StudentMetrics';
import { useClassData } from '@/hooks/useClassData';
import AnimatedLoader from '@/components/ui/animated-loader';

const StudentClassView = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { classData, isLoading, error, refetchData } = useClassData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async (showToast = true) => {
    setRefreshing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Refreshing metrics for user:", user.id);
      
      const { error: recalcError } = await supabase.rpc(
        'recalculate_student_metrics',
        { target_student_id: user.id }
      );
      
      if (recalcError) {
        console.error("Error recalculating metrics:", recalcError);
        throw recalcError;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        <AnimatedLoader 
          size="md"
          message={t("loading")} 
        />
      </div>
    );
  }

  if (error) {
    console.error('StudentClassView error:', error);
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchData()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!classData) {
    console.log('No class data found for current user');
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">{t("noClassJoined")}</p>
          <p className="text-sm text-muted-foreground">
            {t("useClassCodeToJoin")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">{classData.name}</CardTitle>
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
        className={classData.name}
        teacherName={classData.teacher_name}
        teacherEmail={classData.teacher_email}
        joinedAt={classData.enrolled_at}
        code={classData.class_code}
      />

      <CardContent>
        {classData.metrics ? (
          <StudentMetrics metrics={classData.metrics} />
        ) : (
          <p className="text-foreground">{t("loadingMetrics")}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentClassView;
