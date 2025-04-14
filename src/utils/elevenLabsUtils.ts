
import { useConversation } from '@11labs/react';

// Configuration for the ElevenLabs agents
export const SPANISH_TUTOR_AGENT_ID = 'AOv9JDhkEdMmiU61vHg9'; // Spanish tutor for English speakers
export const ENGLISH_TUTOR_AGENT_ID = 'LGA4iRGgLlVbWPluqq23'; // English tutor for Spanish speakers
export const PORTUGUESE_TUTOR_AGENT_ID = 'WuaaV0Pu1tinWfjSk9CY'; // Portuguese tutor
export const KOREAN_TUTOR_AGENT_ID = 'gLUyjMusYz1pumoMfoQv'; // Korean tutor for English learners
export const ARABIC_TUTOR_AGENT_ID = 'RFO6KG9COLQqxnxRzI0L'; // Arabic tutor for English learners
export const MANDARIN_TUTOR_AGENT_ID = 'MRQcwp0aUbQnbcLE0fjf'; // English tutor for Mandarin speakers
export const VIETNAMESE_TUTOR_AGENT_ID = 'pc9rZRG8F2WnPEdV77yG'; // English tutor for Vietnamese speakers
export const FRENCH_TUTOR_AGENT_ID = 'femZJQOmwbvFjGG46OO0'; // English tutor for French speakers
export const JAPANESE_TUTOR_AGENT_ID = 'pViLJpVDvXIBEL7BXbam'; // Updated English tutor for Japanese speakers
export const RUSSIAN_TUTOR_AGENT_ID = 'rlHSjx9Y19IqjWTspVRq'; // English tutor for Russian speakers, updated
export const UKRAINIAN_TUTOR_AGENT_ID = 'eu1E63tLoKFYPB28lWks'; // English tutor for Ukrainian speakers
export const HINDI_TUTOR_AGENT_ID = 'KZaHLSD2sG8AptT09Feu'; // English tutor for Hindi speakers
export const INDONESIAN_TUTOR_AGENT_ID = 'n0xawTpIZ6Zojiox0KZ5'; // English tutor for Indonesian speakers

// Language to agent ID mapping for better maintainability
const LANGUAGE_TO_AGENT_ID: Record<string, string> = {
  "english": SPANISH_TUTOR_AGENT_ID, // English speakers learn Spanish
  "spanish": ENGLISH_TUTOR_AGENT_ID, // Spanish speakers learn English
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
 * @param language The user's current language (english, spanish, portuguese, korean, arabic, mandarin, vietnamese, french, japanese, russian, ukrainian, indonesian)
 * @returns The appropriate agent ID for the user's language
 */
export const getAgentIdForLanguage = (language: string): string => {
  const normalizedLanguage = language.toLowerCase();
  
  if (LANGUAGE_TO_AGENT_ID[normalizedLanguage]) {
    console.log(`Using tutor for ${normalizedLanguage} speaker:`, LANGUAGE_TO_AGENT_ID[normalizedLanguage]);
    return LANGUAGE_TO_AGENT_ID[normalizedLanguage];
  }
  
  // Default to Spanish tutor for English speakers if language not found
  console.log("Language not found, using default Spanish tutor for English speakers:", SPANISH_TUTOR_AGENT_ID);
  return SPANISH_TUTOR_AGENT_ID;
};

/**
 * Hook for using ElevenLabs conversation in React components
 */
export const useElevenLabsAgent = (language: string = 'english') => {
  // Use the @11labs/react useConversation hook
  const conversation = useConversation();
  
  // Helper to check if conversation is active
  const isConversationActive = () => conversation.status !== "disconnected";
  
  const startAgent = async () => {
    try {
      // Request microphone access if needed
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.error("Microphone access error:", error);
        throw new Error("Microphone access is required for voice chat");
      }
      
      // Use the appropriate agent ID based on language
      const agentId = getAgentIdForLanguage(language);
      console.log(`Starting ElevenLabs agent for ${language} with ID: ${agentId}`);
      
      // If already connected, disconnect first
      if (isConversationActive()) {
        await conversation.endSession();
        console.log("Ended previous ElevenLabs session");
      }
      
      // Start a new session with the appropriate agent
      console.log(`Attempting to start new session with agent ID: ${agentId}`);
      const conversationId = await conversation.startSession({ 
        agentId: agentId 
      });
      console.log(`Successfully started ElevenLabs session: ${conversationId}`);
      return conversationId;
    } catch (error) {
      console.error("Error starting ElevenLabs agent:", error);
      return null;
    }
  };
  
  const stopAgent = async () => {
    try {
      if (isConversationActive()) {
        await conversation.endSession();
        console.log("Successfully ended ElevenLabs session");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error stopping ElevenLabs agent:", error);
      return false;
    }
  };
  
  return {
    startAgent,
    stopAgent,
    isConnected: isConversationActive(),
    isSpeaking: conversation.isSpeaking
  };
};
