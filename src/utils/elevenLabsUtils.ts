
// This file maintains compatibility with existing code that references ElevenLabs functionality
import { ELEVEN_LABS_AGENT_ID } from './constants';

// Stub function for compatibility - returns a default ID
export const getDefaultAgentId = (): string => {
  return ELEVEN_LABS_AGENT_ID;
};

// Provide compatibility implementations of these functions
export const getAgentIdForLanguage = (language: string): string => {
  console.log(`Note: ElevenLabs functionality removed - getAgentIdForLanguage called for ${language}`);
  return ELEVEN_LABS_AGENT_ID;
};

export const getVoiceIdForLanguage = (language: string): string => {
  console.log(`Note: ElevenLabs functionality removed - getVoiceIdForLanguage called for ${language}`);
  return "default-voice-id";
};

export const formatConversationHistory = (messages: any[]): any[] => {
  console.log("Note: ElevenLabs functionality removed - formatConversationHistory called");
  return messages;
};

// Export other placeholder utilities to maintain compatibility
