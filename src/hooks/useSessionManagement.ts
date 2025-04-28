
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import type { MessageCount } from "@/types/chat";

export const useSessionManagement = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState<MessageCount>({ inputs: 0, outputs: 0 });
  const { toast } = useToast();
  const { t } = useLocalization();
  
  // Initialize session when component mounts
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Track this as a text practice API call
        await supabase
          .from('api_calls_tracking')
          .insert({
            user_id: user.id,
            call_type: 'text_practice'
          });
          
        console.log('Created text practice session for:', user.id);
        
        // Force a recalculation of metrics after creating a text practice session
        try {
          const { error: recalcError } = await supabase.rpc('recalculate_student_metrics', { 
            target_student_id: user.id 
          });
          
          if (recalcError) {
            console.error('Error recalculating metrics:', recalcError);
            toast({
              title: t("error"),
              description: t("metricsUpdateFailed"),
              variant: "destructive",
            });
          }
        } catch (recalcError) {
          console.error('Exception recalculating metrics:', recalcError);
        }

      } catch (error: any) {
        console.error('Error creating chat session:', error);
        toast({
          title: t("error"),
          description: t("failedToCreateSession"),
          variant: "warning",
        });
      }
    };

    initSession();
  }, [toast, t]);
  
  return { messageCount, setMessageCount };
};
