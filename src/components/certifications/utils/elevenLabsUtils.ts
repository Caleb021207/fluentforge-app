
import { useConversation } from '@11labs/react';

// Configuration for the ElevenLabs agents
export const SPANISH_TUTOR_AGENT_ID = 'Qc5G2DZi0jRmMf3CzC8f'; // Spanish tutor
export const ENGLISH_TUTOR_AGENT_ID = 'LGA4iRGgLlVbWPluqq23'; // English tutor
export const PORTUGUESE_TUTOR_AGENT_ID = 'WuaaV0Pu1tinWfjSk9CY'; // Portuguese tutor

/**
 * Gets the appropriate agent ID based on the user's language
 * @param language The user's current language (english, spanish, portuguese)
 * @returns The appropriate agent ID for the user's language
 */
export const getAgentIdForLanguage = (language: string): string => {
  // If the user is Portuguese, use their specific tutor
  if (language === "portuguese") {
    console.log("Using Portuguese tutor:", PORTUGUESE_TUTOR_AGENT_ID);
    return PORTUGUESE_TUTOR_AGENT_ID;
  }
  // For Spanish speakers, use the English tutor
  if (language === "spanish") {
    console.log("Using English tutor for Spanish speaker:", ENGLISH_TUTOR_AGENT_ID);
    return ENGLISH_TUTOR_AGENT_ID;
  }
  // For English speakers, use the Spanish tutor
  console.log("Using Spanish tutor for English speaker:", SPANISH_TUTOR_AGENT_ID);
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
