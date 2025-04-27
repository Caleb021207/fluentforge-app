
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSessionManagement = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState({ inputs: 0, outputs: 0 });

  useEffect(() => {
    const initSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
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
      }
    };

    initSession();

    return () => {
      if (sessionId) {
        supabase
          .from('text_practice_interactions')
          .update({
            session_end: new Date().toISOString(),
            inputs_count: messageCount.inputs,
            outputs_count: messageCount.outputs
          })
          .eq('id', sessionId)
          .then(({ error }) => {
            if (error) console.error('Error closing session:', error);
          });
      }
    };
  }, []);

  return { sessionId, messageCount, setMessageCount };
};
