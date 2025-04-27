
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { supabase } from '@/integrations/supabase/client';
import type { ClassroomResponse } from '@/types/classroom';

export function useCreateClassroom() {
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

      const response = data as unknown as ClassroomResponse;
      if (response.success) {
        toast({
          title: t("success"),
          description: response.message
        });
        return response;
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

  return { createClassroom };
}
