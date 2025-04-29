
/**
 * This file is kept for backward compatibility
 * New code should import directly from @/utils/tts
 */

import {
  playTTS as playTTSInternal,
  preloadTTS as preloadTTSInternal,
  isTTSSupported as isTTSSupportedInternal,
  getSpeechSynthesisLanguageCode as getLanguageCodeInternal,
} from './tts';

import type { TTSOptions } from './tts/types';

export type { TTSOptions };

export const getSpeechSynthesisLanguageCode = getLanguageCodeInternal;
export const isTTSSupported = isTTSSupportedInternal;
export const playTTS = playTTSInternal;
export const preloadTTS = preloadTTSInternal;
