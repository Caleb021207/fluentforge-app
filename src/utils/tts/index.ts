
export { languageCodeMap, TTL_DURATION, CACHE_CLEANUP_INTERVAL } from './constants';
export { ttsCache } from './cache';
export { isTTSSupported, useBrowserTTS } from './browserTTS';
export { playTTS, preloadTTS } from './supabaseTTS';
export { trackTTSUsage } from './tracking';
export type { TTSOptions } from './types';

/**
 * Returns the language code for a language
 * @param language The language name (english, spanish, etc.)
 * @returns The language code (en-US, es-ES, etc.)
 */
export const getSpeechSynthesisLanguageCode = (language: string): string => {
  const { languageCodeMap } = require('./constants');
  return languageCodeMap[language?.toLowerCase()] || 'en-US';
};
