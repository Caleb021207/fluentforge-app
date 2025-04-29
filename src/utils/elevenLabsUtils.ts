
import { useEffect, useState } from 'react';

// Configuration for the ElevenLabs agents (placeholders)
export const SPANISH_TUTOR_AGENT_ID = 'placeholder_spanish_agent_id'; 
export const ENGLISH_TUTOR_AGENT_ID = 'placeholder_english_agent_id';
export const PORTUGUESE_TUTOR_AGENT_ID = 'placeholder_portuguese_agent_id';
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

// Language to agent ID mapping (placeholders)
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
 * Gets the appropriate agent ID based on the user's language (placeholder implementation)
 */
export const getAgentIdForLanguage = (language: string): string => {
  const normalizedLanguage = language.toLowerCase();
  
  if (LANGUAGE_TO_AGENT_ID[normalizedLanguage]) {
    console.log(`[PLACEHOLDER] Would use tutor for ${normalizedLanguage} speaker:`, LANGUAGE_TO_AGENT_ID[normalizedLanguage]);
    return LANGUAGE_TO_AGENT_ID[normalizedLanguage];
  }
  
  console.log("[PLACEHOLDER] Language not found, would use default Spanish tutor for English speakers");
  return SPANISH_TUTOR_AGENT_ID;
};

/**
 * Initializes an ElevenLabs conversation agent (placeholder implementation)
 */
export const initializeElevenLabsAgent = async (language: string = 'english') => {
  console.log(`[PLACEHOLDER] Would initialize ElevenLabs agent for ${language}`);
  return `placeholder-conversation-${Date.now()}-${language}`;
};

/**
 * Ends an active ElevenLabs conversation (placeholder implementation)
 */
export const endElevenLabsConversation = async (conversationId: string) => {
  console.log(`[PLACEHOLDER] Would end ElevenLabs conversation: ${conversationId}`);
  return true;
};

/**
 * Hook for using ElevenLabs conversation in React components (placeholder implementation)
 */
export const useElevenLabsAgent = (language: string = 'english') => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Helper to check if conversation is active
  const isConversationActive = () => isConnected;
  
  const startAgent = async () => {
    console.log(`[PLACEHOLDER] Would start ElevenLabs agent for ${language}`);
    setIsConnected(true);
    return `placeholder-conversation-${Date.now()}-${language}`;
  };
  
  const stopAgent = async () => {
    console.log('[PLACEHOLDER] Would stop ElevenLabs agent');
    setIsConnected(false);
    return true;
  };
  
  return {
    startAgent,
    stopAgent,
    isConnected,
    isSpeaking
  };
};
