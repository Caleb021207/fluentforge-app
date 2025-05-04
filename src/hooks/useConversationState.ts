
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { calculateRemainingWeeklyTime } from "@/utils/voiceChatUtils";

export const useConversationState = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { toast } = useToast();
  const { t } = useLocalization();

  const createConversationSession = async (userId: string) => {
    try {
      // Create premium voice session record
      const { data: sessionData, error: sessionError } = await supabase
        .from('premium_voice_chat_sessions')
        .insert({
          user_id: userId
        })
        .select('id')
        .single();
      
      if (sessionError) {
        console.error("Error creating session record:", sessionError);
        throw new Error(t("failedToCreateSession"));
      }
      
      setCurrentSessionId(sessionData.id);
      
      // Track this as a premium voice API call
      await supabase
        .from('api_calls_tracking')
        .insert({
          user_id: userId,
          call_type: 'premium_voice'
        });

      return sessionData.id;
    } catch (error) {
      console.error("Error creating conversation session:", error);
      throw error;
    }
  };

  const endConversationSession = async (userId: string) => {
    if (!currentSessionId) return false;

    try {
      const { error } = await supabase
        .from('premium_voice_chat_sessions')
        .update({
          session_end: new Date().toISOString()
        })
        .eq('id', currentSessionId);
        
      if (error) {
        console.error("Error updating session end time:", error);
        throw error;
      }

      // Recalculate metrics after closing a session
      await supabase.rpc('recalculate_student_metrics', { 
        target_student_id: userId 
      });

      const remainingTime = await calculateRemainingWeeklyTime(userId);
      
      setCurrentSessionId(null);
      setConnectionAttempts(0);
      
      return remainingTime;
    } catch (error) {
      console.error("Error ending conversation session:", error);
      throw error;
    }
  };

  return {
    currentSessionId,
    connectionAttempts,
    setConnectionAttempts,
    createConversationSession,
    endConversationSession
  };
};
