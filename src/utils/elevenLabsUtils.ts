
// This file contains utilities for working with the ElevenLabs API

export const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface TTSOptions {
  text: string;
  voice_id: string;
  model_id?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export async function generateTTS({ 
  text, 
  voice_id,
  model_id = 'eleven_multilingual_v2', 
  onStart,
  onComplete,
  onError 
}: TTSOptions): Promise<string> {
  try {
    if (onStart) onStart();
    
    const response = await fetch(`${ELEVEN_LABS_API_URL}/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVEN_LABS_API_KEY || '',
      },
      body: JSON.stringify({
        text,
        model_id,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'Failed to generate speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    if (onComplete) onComplete();
    
    return audioUrl;
  } catch (error) {
    if (onError) onError(error as Error);
    throw error;
  }
}

// Mock implementation for the ElevenLabs agent hook for compatibility
export const useElevenLabsAgent = (language: string) => {
  return {
    startAgent: async (apiKey: string) => {
      console.log(`Mock ElevenLabs agent: using OpenAI Chat GPT Nano and Azure TTS instead`);
      return "mock-conversation-id";
    },
    stopAgent: async () => {
      return true;
    },
    isConnected: false,
    isSpeaking: false,
    conversation: []
  };
};

// Compatibility function for existing code
export const getAgentIdForLanguage = (language: string) => {
  return 'mock-agent-id';
};
