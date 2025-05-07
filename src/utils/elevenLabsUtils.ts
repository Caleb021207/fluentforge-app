
import { useEffect, useState } from 'react';
import { useConversation } from '@11labs/react';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';

// Configuration for the ElevenLabs agents (updated with real agent IDs)
export const SPANISH_TUTOR_AGENT_ID = 'LGA4iRGgLlVbWPluqq23'; 
export const ENGLISH_TUTOR_AGENT_ID = 'placeholder_english_agent_id';
export const PORTUGUESE_TUTOR_AGENT_ID = 'WuaaV0Pu1tinWfjSk9CY';
export const KOREAN_TUTOR_AGENT_ID = 'placeholder_korean_agent_id';
export const ARABIC_TUTOR_AGENT_ID = 'placeholder_arabic_agent_id';
export const MANDARIN_TUTOR_AGENT_ID = 'placeholder_mandarin_agent_id';
export const VIETNAMESE_TUTOR_AGENT_ID = 'placeholder_vietnamese_agent_id';
export const FRENCH_TUTOR_AGENT_ID = 'placeholder_french_agent_id';
export const JAPANESE_TUTOR_AGENT_ID = 'placeholder_japanese_agent_id';
export const RUSSIAN_TUTOR_AGENT_ID = 'placeholder_russian_agent_id';
export const UKRAINIAN_TUTOR_AGENT_ID = 'placeholder_ukrainian_agent_id';
export const HINDI_TUTOR_AGENT_ID = 'placeholder_hindi_agent_id';
export const INDONESIAN_TUTOR_AGENT_ID = 'placeholder_indonesian_agent_id';

// Language to agent ID mapping (updated Spanish and Portuguese with real IDs)
const LANGUAGE_TO_AGENT_ID: Record<string, string> = {
  "english": SPANISH_TUTOR_AGENT_ID,
  "spanish": ENGLISH_TUTOR_AGENT_ID,
  "portuguese": PORTUGUESE_TUTOR_AGENT_ID,
  "korean": KOREAN_TUTOR_AGENT_ID,
  "arabic": ARABIC_TUTOR_AGENT_ID,
  "mandarin": MANDARIN_TUTOR_AGENT_ID,
  "vietnamese": VIETNAMESE_TUTOR_AGENT_ID,
  "french": FRENCH_TUTOR_AGENT_ID,
  "japanese": JAPANESE_TUTOR_AGENT_ID,
  "russian": RUSSIAN_TUTOR_AGENT_ID,
  "ukrainian": UKRAINIAN_TUTOR_AGENT_ID,
  "hindi": HINDI_TUTOR_AGENT_ID,
  "indonesian": INDONESIAN_TUTOR_AGENT_ID
};

/**
 * Gets the appropriate agent ID based on the user's language
 */
export const getAgentIdForLanguage = (language: string): string => {
  const normalizedLanguage = language.toLowerCase();
  
  if (LANGUAGE_TO_AGENT_ID[normalizedLanguage]) {
    console.log(`[ElevenLabs] Using tutor for ${normalizedLanguage} speaker:`, LANGUAGE_TO_AGENT_ID[normalizedLanguage]);
    return LANGUAGE_TO_AGENT_ID[normalizedLanguage];
  }
  
  console.log("[ElevenLabs] Language not found, using default Spanish tutor for English speakers");
  return SPANISH_TUTOR_AGENT_ID;
};

/**
 * Initializes an ElevenLabs conversation agent
 */
export const initializeElevenLabsAgent = async (language: string = 'english', apiKey: string) => {
  console.log(`[ElevenLabs] Initializing agent for ${language}`);
  
  // In a real implementation, this would be handled by the @11labs/react useConversation hook
  // This is just a fallback for if the hook fails
  return `conversation-${Date.now()}-${language}`;
};

/**
 * Ends an active ElevenLabs conversation
 */
export const endElevenLabsConversation = async (conversationId: string) => {
  console.log(`[ElevenLabs] Ending conversation: ${conversationId}`);
  return true;
};

/**
 * Hook for using ElevenLabs conversation in React components
 */
export const useElevenLabsAgent = (language: string = 'english') => {
  const { t } = useLocalization();
  const { toast } = useToast();
  
  // Use the official ElevenLabs React hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('[ElevenLabs] Connection established');
    },
    onDisconnect: () => {
      console.log('[ElevenLabs] Connection ended');
    },
    onMessage: (message) => {
      console.log('[ElevenLabs] Message received:', message);
    },
    onError: (error) => {
      console.error('[ElevenLabs] Error:', error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    }
  });
  
  // Helper to check if conversation is active
  const isConversationActive = () => conversation.status === 'connected';
  
  const startAgent = async (apiKey: string) => {
    try {
      console.log(`[ElevenLabs] Starting agent for ${language}`);
      
      const agentId = getAgentIdForLanguage(language);
      
      // Start the conversation session with the appropriate agent ID
      const conversationId = await conversation.startSession({
        agentId: agentId
      });
      
      console.log(`[ElevenLabs] Started conversation ${conversationId}`);
      return conversationId;
      
    } catch (error) {
      console.error('[ElevenLabs] Failed to start agent:', error);
      toast({
        title: t("error"),
        description: t("failedToStartSession"),
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const stopAgent = async () => {
    try {
      console.log('[ElevenLabs] Stopping agent');
      await conversation.endSession();
      return true;
    } catch (error) {
      console.error('[ElevenLabs] Failed to stop agent:', error);
      return false;
    }
  };
  
  return {
    startAgent,
    stopAgent,
    isConnected: conversation.status === 'connected',
    isSpeaking: conversation.isSpeaking,
    conversation
  };
};
