
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useConversationState = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { toast } = useToast();
  const { t } = useLocalization();

  const createConversationSession = async (userId: string) => {
    try {
      // Create a simple session tracking record
      const sessionId = `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSessionId(sessionId);
      
      // Track this as a voice chat API call
      await supabase
        .from('api_calls_tracking')
        .insert({
          user_id: userId,
          service: 'voice_chat',
          endpoint: 'conversation_session'
        });

      return sessionId;
    } catch (error) {
      console.error("Error creating conversation session:", error);
      throw error;
    }
  };

  const endConversationSession = async (userId: string) => {
    if (!currentSessionId) return false;

    try {
      // Track session end
      await supabase
        .from('api_calls_tracking')
        .insert({
          user_id: userId,
          service: 'voice_chat',
          endpoint: 'session_end'
        });

      setCurrentSessionId(null);
      setConnectionAttempts(0);
      
      return true;
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
