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

/**
 * Recalculates metrics for one student, or — when no student is given — for
 * every student enrolled in the class. (A previous version silently
 * recalculated the *teacher's* own metrics in the all-students case.)
 */
export const RefreshMetricsButton = ({ classId, studentId, onSuccess }: RefreshMetricsButtonProps) => {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (studentId) {
        const { error } = await supabase.rpc('recalculate_student_metrics', {
          target_student_id: studentId,
        });
        if (error) throw error;
      } else {
        // Refresh every enrolled student in this class.
        const { data: enrollments, error: enrollError } = await supabase
          .from('student_enrollments')
          .select('student_id')
          .eq('class_id', classId);
        if (enrollError) throw enrollError;

        const studentIds = [...new Set((enrollments || []).map(e => e.student_id))];
        if (studentIds.length === 0) {
          toast({
            title: CLASSROOM_TEXT.SUCCESS,
            description: "No students enrolled in this class yet.",
          });
          setRefreshing(false);
          onSuccess?.();
          return;
        }

        const results = await Promise.allSettled(
          studentIds.map(id =>
            supabase.rpc('recalculate_student_metrics', { target_student_id: id })
          )
        );
        const failed = results.filter(
          r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)
        ).length;
        if (failed > 0) {
          console.warn(`Metrics refresh failed for ${failed}/${studentIds.length} students`);
        }
      }

      toast({
        title: CLASSROOM_TEXT.SUCCESS,
        description: studentId
          ? CLASSROOM_TEXT.STUDENT_METRICS_REFRESHED
          : CLASSROOM_TEXT.ALL_METRICS_REFRESHED,
      });

      onSuccess?.();
      setRefreshing(false);
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
