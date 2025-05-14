
import { ELEVEN_LABS_AGENT_ID } from "./constants";

export const getElevenLabsVoiceId = (language: string) => {
  // This function maps languages to voice IDs
  const voiceMap: Record<string, string> = {
    spanish: 'TxGEqnHWrfWFTfGW9XjX',
    english: '21m00Tcm4TlvDq8ikWAM',
    portuguese: 'D38z5RcWu1voky8WS1ja',
    // Add more languages as needed
  };
  
  return voiceMap[language.toLowerCase()] || voiceMap.english;
};

export const getElevenLabsModel = () => {
  return 'eleven_multilingual_v2';
};

export const getElevenLabsAgentId = (language: string) => {
  return getAgentIdForLanguage(language);
};

export const getAgentIdForLanguage = (language: string) => {
  // A mapping of languages to agent IDs could be added here
  // For now, we return the default agent ID
  return ELEVEN_LABS_AGENT_ID;
};

// Mock implementation for the useElevenLabsAgent hook to fix build errors
export const useElevenLabsAgent = (language: string) => {
  return {
    startAgent: async (apiKey: string) => {
      console.log(`Starting ElevenLabs agent for ${language} with API key`);
      return "mock-conversation-id";
    },
    stopAgent: async () => {
      console.log(`Stopping ElevenLabs agent for ${language}`);
      return true;
    },
    isConnected: false,
    isSpeaking: false,
    conversation: []
  };
};

// Add any other ElevenLabs related utility functions here
