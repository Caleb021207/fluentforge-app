
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

        const { data, error } = await supabase
          .from('text_practice_interactions')
          .insert({
            user_id: user.id,
            inputs_count: 0,
            outputs_count: 0
          })
          .select()
          .single();

        if (error) throw error;
        setSessionId(data.id);
      } catch (error: any) {
        console.error('Error creating chat session:', error);
        toast({
          title: t("sessionError") || "Session Error",
          description: t("failedToCreateSession") || "Failed to create chat session.",
          variant: "warning",
        });
      }
    };

    initSession();
  }, [toast, t]);

  // Update session when component unmounts or user leaves page
  useEffect(() => {
    // Create a function to handle closing the session
    const closeSession = async () => {
      if (!sessionId) return;
      
      try {
        await supabase
          .from('text_practice_interactions')
          .update({
            session_end: new Date().toISOString(),
            inputs_count: messageCount.inputs,
            outputs_count: messageCount.outputs
          })
          .eq('id', sessionId);
      } catch (error: any) {
        console.error('Error closing session:', error);
      }
    };
    
    // Call closeSession when component unmounts
    return () => {
      closeSession();
    };
  }, [sessionId, messageCount]);
  
  // Add periodic updates during long sessions
  useEffect(() => {
    if (!sessionId) return;
    
    // Update session data every 5 minutes to prevent data loss
    const intervalId = setInterval(async () => {
      try {
        await supabase
          .from('text_practice_interactions')
          .update({
            inputs_count: messageCount.inputs,
            outputs_count: messageCount.outputs
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [sessionId, messageCount]);

  return { sessionId, messageCount, setMessageCount };
};
