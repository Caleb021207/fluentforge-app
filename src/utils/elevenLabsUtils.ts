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
  // A mapping of languages to agent IDs could be added here
  // For now, we return the default agent ID
  return ELEVEN_LABS_AGENT_ID;
};

// Add any other ElevenLabs related utility functions here
