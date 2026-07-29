
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveCertificationTranscript } from "@/utils/serverWrites";

interface TranscriptState {
  userMessages: any[];
  aiResponses: any[];
}

export const useConversationTranscript = (attemptId: string | null) => {
  const [transcriptState, setTranscriptState] = useState<TranscriptState>({
    userMessages: [],
    aiResponses: [],
  });

  const addUserMessage = (message: any) => {
    setTranscriptState(prev => ({
      ...prev,
      userMessages: [...prev.userMessages, message]
    }));
  };

  const addAIResponse = (message: any) => {
    setTranscriptState(prev => ({
      ...prev,
      aiResponses: [...prev.aiResponses, message]
    }));
  };

  const saveTranscript = async (userId: string, analysisData: any) => {
    if (!attemptId) return null;
    
    try {
      const result: any = await saveCertificationTranscript({
        attempt_id: attemptId,
        user_transcripts: transcriptState.userMessages,
        ai_responses: transcriptState.aiResponses,
      });
      return result?.transcript ?? null;
    } catch (error) {
      console.error("Error saving transcript:", error);
      return null;
    }
  };

  return {
    transcriptState,
    addUserMessage,
    addAIResponse,
    saveTranscript
  };
};
