
import { useConversation } from '@11labs/react';

// Configuration for the ElevenLabs agents
export const SPANISH_TUTOR_AGENT_ID = 'Qc5G2DZi0jRmMf3CzC8f'; // Spanish tutor
export const ENGLISH_TUTOR_AGENT_ID = 'LGA4iRGgLlVbWPluqq23'; // English tutor (updated ID)

/**
 * Gets the appropriate agent ID based on the user's language
 * @param language The user's current language (english, spanish, portuguese)
 * @returns The appropriate agent ID for the user's language
 */
export const getAgentIdForLanguage = (language: string): string => {
  // For Spanish or Portuguese speakers, use the English tutor
  if (language === "spanish" || language === "portuguese") {
    return ENGLISH_TUTOR_AGENT_ID;
  }
  // For English speakers, use the Spanish tutor
  return SPANISH_TUTOR_AGENT_ID;
};

/**
 * Initializes an ElevenLabs conversation agent
 * @returns A promise that resolves to the conversation ID
 */
export const initializeElevenLabsAgent = async (language: string = 'english') => {
  try {
    // This is where you would integrate with the ElevenLabs API
    // For now, we'll return a mock conversation ID
    return `mock-conversation-${Date.now()}-${language}`;
  } catch (error) {
    console.error("Error initializing ElevenLabs agent:", error);
    return null;
  }
};

/**
 * Ends an active ElevenLabs conversation
 * @param conversationId The ID of the conversation to end
 */
export const endElevenLabsConversation = async (conversationId: string) => {
  try {
    console.log(`Ending ElevenLabs conversation: ${conversationId}`);
    // This is where you would call the ElevenLabs API to end the conversation
    return true;
  } catch (error) {
    console.error("Error ending ElevenLabs conversation:", error);
    return false;
  }
};

/**
 * Hook for using ElevenLabs conversation in React components
 */
export const useElevenLabsAgent = (language: string = 'english') => {
  // Here you would use the @11labs/react useConversation hook
  // This is a simplified mock implementation
  const conversation = useConversation();
  
  const startAgent = async () => {
    try {
      // Use the appropriate agent ID based on language
      const agentId = getAgentIdForLanguage(language);
      console.log(`Starting ElevenLabs agent for ${language} with ID: ${agentId}`);
      
      const conversationId = await conversation.startSession({ 
        agentId: agentId 
      });
      return conversationId;
    } catch (error) {
      console.error("Error starting ElevenLabs agent:", error);
      return null;
    }
  };
  
  const stopAgent = async () => {
    try {
      await conversation.endSession();
      return true;
    } catch (error) {
      console.error("Error stopping ElevenLabs agent:", error);
      return false;
    }
  };
  
  return {
    startAgent,
    stopAgent,
    isConnected: conversation.status === "connected",
    isSpeaking: conversation.isSpeaking
  };
};
