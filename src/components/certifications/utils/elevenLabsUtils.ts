
import { useConversation } from '@11labs/react';

// Configuration for the ElevenLabs agent
export const ELEVEN_LABS_AGENT_ID = 'your-eleven-labs-agent-id'; // Replace with your agent ID

/**
 * Initializes an ElevenLabs conversation agent
 * @returns A promise that resolves to the conversation ID
 */
export const initializeElevenLabsAgent = async () => {
  try {
    // This is where you would integrate with the ElevenLabs API
    // For now, we'll return a mock conversation ID
    return `mock-conversation-${Date.now()}`;
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
export const useElevenLabsAgent = () => {
  // Here you would use the @11labs/react useConversation hook
  // This is a simplified mock implementation
  const conversation = useConversation();
  
  const startAgent = async () => {
    try {
      // This would be replaced with actual conversation.startSession call
      console.log("Starting ElevenLabs agent...");
      const conversationId = await conversation.startSession({ 
        agentId: ELEVEN_LABS_AGENT_ID 
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
