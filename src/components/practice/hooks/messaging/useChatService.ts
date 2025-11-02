
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { logDataAccess } from "@/utils/contentSafetyUtils";
import { ChatResponse } from "./types";

export const useChatService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const sendChatRequest = async (
    message: string, 
    userLanguage: string, 
    targetLanguage: string,
    correctGrammar: boolean = false,
    conversationHistory: {role: 'user' | 'assistant' | 'system'; content: string}[] = [],
    conversationLevel: string = "intermediate"
  ): Promise<ChatResponse | null> => {
    if (!message || message.trim() === "") {
      toast({
        title: t("error"),
        description: t("emptyMessage"),
        variant: "destructive",
      });
      return null;
    }
    
    setIsLoading(true);
    
    try {
      const userId = "anonymous-or-current-user-id";
      logDataAccess(
        userId,
        "practice_session", 
        "student",
        "language_practice"
      );
      
      console.log('Sending message to AI tutor:', { 
        message, 
        userLanguage, 
        targetLanguage,
        requestType: 'conversation',
        requestTranslation: true,
        correctGrammar,
        conversationHistoryLength: conversationHistory.length,
        conversationLevel
      });
      
      // Explicitly define language roles to avoid confusion
      // userLanguage = native language of the user (e.g., German, Italian)
      // targetLanguage = language the user is learning (e.g., English, Spanish)
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: message,
          userLanguage: userLanguage,  // Native language of the user
          targetLanguage: targetLanguage, // Language the user is learning
          requestType: 'conversation',
          requestTranslation: true,
          correctGrammar: correctGrammar,  // Flag to control grammar correction
          conversationHistory: conversationHistory,  // Add conversation history for context
          conversationLevel: conversationLevel  // Add conversation level
        }
      });

      if (error) {
        console.error('Supabase invoke error:', error);
        throw error;
      }

      console.log('Response from AI tutor:', {
        hasData: !!data,
        hasTranslation: data && 'translation' in data,
        translationType: data?.translation ? typeof data.translation : 'none',
        userLanguage,
        targetLanguage,
        sampleContent: data?.content ? data.content.substring(0, 50) + '...' : 'none',
        sampleTranslation: data?.translation ? 
          (typeof data.translation === 'string' ? 
            data.translation.substring(0, 50) + '...' : 
            JSON.stringify(data.translation).substring(0, 50) + '...'
          ) : 'none'
      });
      
      // Handle case where response is missing content
      if (!data) {
        console.error('Empty response from AI tutor');
        throw new Error("Empty response from AI tutor");
      }
      
      if (data.error) {
        console.error('Error from AI tutor:', data.error);
        throw new Error(data.error);
      }
      
      if (!data.content) {
        console.error('Invalid response from AI tutor - missing content:', data);
        throw new Error("Response from AI tutor is missing content");
      }
      
      return {
        content: data.content,
        translation: data.translation,
        usingFallbackModel: data.usingFallbackModel
      };
      
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    setIsLoading,
    sendChatRequest
  };
};
