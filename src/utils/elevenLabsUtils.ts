
import { useToast } from "@/hooks/use-toast";
import { ELEVEN_LABS_AGENT_ID } from "@/utils/constants";
import { useMicrophoneAccess } from "@/hooks/useMicrophoneAccess";
import { useElevenLabsAgent } from "@/hooks/useElevenLabsAgent";

/**
 * Helper function to get the appropriate ElevenLabs agent ID based on the language
 */
export const getAgentIdForLanguage = (language: string): string => {
  // Default is Spanish tutor
  const DEFAULT_AGENT_ID = ELEVEN_LABS_AGENT_ID;
  
  // Map of language-specific agent IDs
  const languageAgentMap: Record<string, string> = {
    // Agent IDs can be added here for specific languages
    "spanish": DEFAULT_AGENT_ID,
    "portuguese": "POlOTpk6XsLhfvN2SAZ9" // Portuguese tutor for English speakers
  };
  
  return languageAgentMap[language?.toLowerCase()] || DEFAULT_AGENT_ID;
};

/**
 * Formats a message for ElevenLabs agent
 */
export const formatMessageForAgent = (message: string, language: string): string => {
  // Add specific formatting for different languages if needed
  return message;
};

/**
 * Gets the appropriate voice ID for a language
 */
export const getVoiceIdForLanguage = (language: string): string => {
  // Map language codes to voice IDs
  const voiceMap: Record<string, string> = {
    "english": "21m00Tcm4TlvDq8ikWAM", // Rachel voice
    "spanish": "EXAVITQu4vr4xnSDxMaL", // Antonio voice
    "portuguese": "UELtC769oCJ2XhyTIJGW", // Brazilian female voice
    "french": "yoZ06aMxZJJ28mfd3POQ" // French male voice
  };
  
  return voiceMap[language?.toLowerCase()] || voiceMap["english"];
};

/**
 * Formats conversation history for the ElevenLabs agent
 */
export const formatConversationHistory = (messages: Array<{role: string, content: string}>): string => {
  return messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
};

export default {
  getAgentIdForLanguage,
  formatMessageForAgent,
  getVoiceIdForLanguage,
  formatConversationHistory
};
