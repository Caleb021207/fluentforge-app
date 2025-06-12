
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useChatApi = () => {
  const [isLoading, setIsLoading] = useState(false);

  const trackApiCall = async (endpoint: string, service: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('api_calls_tracking')
          .insert({
            service,
            endpoint,
            user_id: user.id
          });
      }
    } catch (error) {
      console.error('Error tracking API call:', error);
    }
  };

  const sendChatMessage = async (message: string, targetLanguage: string, nativeLanguage: string) => {
    setIsLoading(true);
    try {
      await trackApiCall('/chat-with-tutor', 'openai');
      
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          message,
          targetLanguage,
          nativeLanguage
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add sendMessage as an alias for compatibility
  const sendMessage = sendChatMessage;

  return {
    sendChatMessage,
    sendMessage,
    isLoading,
    trackApiCall
  };
};
