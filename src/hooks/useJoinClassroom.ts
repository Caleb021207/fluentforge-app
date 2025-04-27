
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { supabase } from '@/integrations/supabase/client';

export function useJoinClassroom() {
  const { toast } = useToast();
  const { t } = useLocalization();

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

  return { joinClassroom };
}
