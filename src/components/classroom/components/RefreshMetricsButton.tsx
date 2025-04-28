
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

interface RefreshMetricsButtonProps {
  classId: string;
  studentId?: string;
  onSuccess?: () => void;
}

export const RefreshMetricsButton = ({ classId, studentId, onSuccess }: RefreshMetricsButtonProps) => {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log("Starting metrics recalculation for:", studentId || "all students");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Call the recalculate_student_metrics function
      const { data, error } = await supabase.rpc(
        'recalculate_student_metrics',
        { target_student_id: studentId || user.id }
      );
      
      if (error) {
        console.error("Error from recalculate_student_metrics:", error);
        throw error;
      }
      
      console.log("Metrics recalculation response:", data);
      
      toast({
        title: CLASSROOM_TEXT.SUCCESS,
        description: studentId 
          ? CLASSROOM_TEXT.STUDENT_METRICS_REFRESHED
          : CLASSROOM_TEXT.ALL_METRICS_REFRESHED,
      });

      // Add a small delay to ensure the database has time to update
      setTimeout(() => {
        if (onSuccess) onSuccess();
        setRefreshing(false);
      }, 2000); // Increased delay for better reliability
      
    } catch (error: any) {
      console.error('Error refreshing metrics:', error);
      toast({
        title: CLASSROOM_TEXT.ERROR,
        description: error.message || CLASSROOM_TEXT.FAILED_TO_REFRESH_METRICS,
        variant: "destructive",
      });
      setRefreshing(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh}
      disabled={refreshing}
    >
      {refreshing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4 mr-2" />
      )}
      {refreshing ? CLASSROOM_TEXT.REFRESHING : CLASSROOM_TEXT.REFRESH_METRICS}
    </Button>
  );
};
