import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TriggerProfilingOptions {
  studentId: string;
  sessionId: string;
  messages: ConversationMessage[];
  topic?: string;
  targetLevel?: string;
}

export const useConversationProfiling = () => {
  const triggerProfiling = useCallback(async ({
    studentId,
    sessionId,
    messages,
    topic,
    targetLevel
  }: TriggerProfilingOptions) => {
    try {
      console.log('[useConversationProfiling] 🎯 Called with:', {
        studentId: studentId?.substring(0, 8) + '...',
        sessionId,
        messageCount: messages.length,
        topic,
        targetLevel
      });

      // Only trigger if we have meaningful conversation (at least 4 messages)
      if (messages.length < 4) {
        console.log('[useConversationProfiling] ⏭️ Skipping: not enough messages');
        return { skipped: true, reason: 'Not enough messages' };
      }

      // Filter to only include actual conversation messages
      const conversationMessages = messages.filter(m => 
        m.content && m.content.trim().length > 0
      );

      console.log('[useConversationProfiling] 📤 Invoking analyze-and-profile edge function:', {
        studentId: studentId?.substring(0, 8) + '...',
        sessionId,
        messageCount: conversationMessages.length
      });

      const { data, error } = await supabase.functions.invoke('analyze-and-profile', {
        body: {
          studentId,
          sessionId,
          messages: conversationMessages,
          topic,
          targetLevel
        }
      });

      if (error) {
        console.error('[useConversationProfiling] ❌ Edge function error:', error);
        return { success: false, error: error.message };
      }

      console.log('[useConversationProfiling] ✅ Profiling result:', data);
      return data;
    } catch (error: any) {
      console.error('[useConversationProfiling] ❌ Exception:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return { triggerProfiling };
};
