
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import type { ClassroomResponse } from '@/types/classroom';

export function useClassroomManagement() {
  const { toast } = useToast();
  const { t } = useLocalization();

  const createClassroom = async (className: string) => {
    try {
      const { data, error } = await supabase.rpc('create_classroom', {
        class_name: className
      });

      if (error) {
        toast({
          title: t("error"),
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      const response = data as ClassroomResponse;
      if (response.success) {
        toast({
          title: t("success"),
          description: response.message
        });
        return data;
      }

      toast({
        title: t("error"),
        description: response.message,
        variant: "destructive"
      });
      return null;
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        title: t("error"),
        description: t("errorCreatingClass"),
        variant: "destructive"
      });
      return null;
    }
  };

  const joinClassroom = async (classCode: string) => {
    try {
      const { data, error } = await supabase.rpc('join_classroom', {
        class_code: classCode
      });

      if (error) {
        toast({
          title: t("error"),
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      const response = data as { success: boolean; message: string; };
      
      toast({
        title: response.success ? t("success") : t("error"),
        description: response.message,
        variant: response.success ? "default" : "destructive"
      });
      
      return response.success;
    } catch (error) {
      console.error('Error joining classroom:', error);
      toast({
        title: t("error"),
        description: t("errorJoiningClass"),
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    createClassroom,
    joinClassroom
  };
}
