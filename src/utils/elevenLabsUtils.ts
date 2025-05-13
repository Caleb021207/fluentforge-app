
import { useToast } from "@/hooks/use-toast";
import { ELEVEN_LABS_AGENT_ID } from "@/utils/constants";
import { useMicrophoneAccess } from "@/hooks/useMicrophoneAccess";

/**
 * Gets the appropriate agent ID for a given language
 * @param language The target language
 * @returns The agent ID
 */
export const getAgentIdForLanguage = (language: string): string => {
  // For now, we only have specific agents for certain languages
  const agentMap: Record<string, string> = {
    spanish: ELEVEN_LABS_AGENT_ID, // Spanish tutor for English speakers
    // Add more language-specific agents as they become available
  };

  // Return the language-specific agent if available, otherwise the default
  return agentMap[language?.toLowerCase()] || ELEVEN_LABS_AGENT_ID;
};

/**
 * Formats a message for the ElevenLabs agent
 */
export const formatMessageForAgent = (message: string): string => {
  return message;
};

/**
 * Gets the appropriate voice ID for a given language
 * @param language The target language
 * @returns The voice ID
 */
export const getVoiceIdForLanguage = (language?: string): string => {
  // Map languages to voice IDs
  const voiceMap: Record<string, string> = {
    english: "EXAVITQu4vr4xnSDxMaL", // American English
    spanish: "29vD33N1CtxCmqQRPOHJ", // Spanish
    // Add more languages and their voice IDs as needed
  };

  return voiceMap[language?.toLowerCase()] || voiceMap["english"];
};

/**
 * Formats conversation history for the ElevenLabs agent
 */
export const formatConversationHistory = (messages: Array<{role: string, content: string}>): string => {
  return messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
};

// Export all functions individually
export {
  // Functions are already exported above
};

// Default export for backward compatibility
export default {
  getAgentIdForLanguage,
  formatMessageForAgent,
  getVoiceIdForLanguage,
  formatConversationHistory
};
