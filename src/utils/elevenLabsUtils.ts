// This file contains utility functions for working with ElevenLabs API

import { ELEVEN_LABS_AGENT_ID } from './constants';

// Agent IDs for different language tutors
export const AGENT_IDS = {
  SPANISH_TUTOR: ELEVEN_LABS_AGENT_ID, // Default Spanish tutor for English speakers
  ENGLISH_TUTOR: 'AOv9JDhkEdMmiU61vHg9', // English tutor for Spanish speakers
  FRENCH_TUTOR: 'pNInz6obpgDQGcFmaJgB', // French tutor
  GERMAN_TUTOR: 'eUnMwx9PYqpHXLtxYMHX', // German tutor
  ITALIAN_TUTOR: 'kgG8CghCrnx3znzKdb4V', // Italian tutor
};

// Voice IDs for different languages
export const VOICE_IDS = {
  SPANISH_FEMALE: '29vD33N1CtxCmqQRPOHJ', // Spanish female voice
  SPANISH_MALE: 'ZQe5CZNOzWyzPSCn5a3c', // Spanish male voice
  ENGLISH_FEMALE: 'EXAVITQu4vr4xnSDxMaL', // English female voice
  ENGLISH_MALE: 'pNInz6obpgDQGcFmaJgB', // English male voice
  FRENCH_FEMALE: 'jBpfuIE2acCO8z3wKNLl', // French female voice
  GERMAN_FEMALE: 'XB0fDUnXU5powFXDhCwa', // German female voice
  ITALIAN_FEMALE: 'zcAOhNBS3c14rBihAFp1', // Italian female voice
};

// Get the appropriate agent ID based on target language
export const getAgentIdForLanguage = (targetLanguage: string): string => {
  const language = targetLanguage.toLowerCase();
  
  switch (language) {
    case 'spanish':
      return AGENT_IDS.SPANISH_TUTOR;
    case 'english':
      return AGENT_IDS.ENGLISH_TUTOR;
    case 'french':
      return AGENT_IDS.FRENCH_TUTOR;
    case 'german':
      return AGENT_IDS.GERMAN_TUTOR;
    case 'italian':
      return AGENT_IDS.ITALIAN_TUTOR;
    default:
      console.warn(`No specific agent ID for language: ${targetLanguage}, using default`);
      return ELEVEN_LABS_AGENT_ID;
  }
};

// Get the appropriate voice ID based on target language and gender
export const getVoiceIdForLanguage = (targetLanguage: string, gender: 'male' | 'female' = 'female'): string => {
  const language = targetLanguage.toLowerCase();
  
  if (language === 'spanish') {
    return gender === 'male' ? VOICE_IDS.SPANISH_MALE : VOICE_IDS.SPANISH_FEMALE;
  } else if (language === 'english') {
    return gender === 'male' ? VOICE_IDS.ENGLISH_MALE : VOICE_IDS.ENGLISH_FEMALE;
  } else if (language === 'french') {
    return VOICE_IDS.FRENCH_FEMALE;
  } else if (language === 'german') {
    return VOICE_IDS.GERMAN_FEMALE;
  } else if (language === 'italian') {
    return VOICE_IDS.ITALIAN_FEMALE;
  }
  
  console.warn(`No specific voice ID for language: ${targetLanguage}, using default`);
  return VOICE_IDS.SPANISH_FEMALE;
};

// Format conversation history for ElevenLabs API
export const formatConversationHistory = (messages: any[]): any[] => {
  return messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
};

// Helper to create conversation parameters
export const createConversationParams = (
  targetLanguage: string,
  initialPrompt?: string,
  speechRate: number = 1.0
) => {
  return {
    agentId: getAgentIdForLanguage(targetLanguage),
    initialMessage: initialPrompt,
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.8,
      style: 0.0,
      speakerBoost: true,
      speechRate: speechRate
    }
  };
};

// Helper to check if browser supports speech synthesis
export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

// Helper to speak text using browser's speech synthesis
export const speakText = (text: string, language: string, rate: number = 1.0): void => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getLanguageCode(language);
  utterance.rate = rate;
  
  window.speechSynthesis.speak(utterance);
};

// Helper to get language code for speech synthesis
export const getLanguageCode = (language: string): string => {
  const languageCodes: Record<string, string> = {
    'english': 'en-US',
    'spanish': 'es-ES',
    'french': 'fr-FR',
    'german': 'de-DE',
    'italian': 'it-IT',
    'portuguese': 'pt-PT',
    'russian': 'ru-RU',
    'japanese': 'ja-JP',
    'korean': 'ko-KR',
    'chinese': 'zh-CN',
    'arabic': 'ar-SA',
    'hindi': 'hi-IN',
    'turkish': 'tr-TR',
    'dutch': 'nl-NL',
    'polish': 'pl-PL',
    'swedish': 'sv-SE',
    'thai': 'th-TH',
    'vietnamese': 'vi-VN'
  };
  
  return languageCodes[language.toLowerCase()] || 'en-US';
};
