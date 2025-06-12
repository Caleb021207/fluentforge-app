
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSessionManagement = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState({ inputs: 0, outputs: 0 });

  const trackSession = async (type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('api_calls_tracking')
          .insert({
            service: 'session',
            endpoint: type,
            user_id: user.id
          });
      }
    } catch (error) {
      console.error('Error tracking session:', error);
    }
  };

  const startSession = async (type: string = 'practice') => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    await trackSession(type);
    return newSessionId;
  };

  const endSession = () => {
    setSessionId(null);
  };

  return {
    sessionId,
    messageCount,
    setMessageCount,
    startSession,
    endSession
  };
};
