
import { languageCodeMap } from './constants';

/**
 * Basic browser TTS detection - just for feature detection, not for actual use
 */
export const isTTSSupported = (): boolean => {
  return typeof window !== 'undefined' && window.speechSynthesis !== undefined;
};

/**
 * Fallback to browser's built-in TTS as a last resort
 */
export const useBrowserTTS = (
  text: string, 
  language: string, 
  onEnd?: () => void, 
  onError?: (error: Error) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.speechSynthesis) {
        const error = new Error("Browser speech synthesis not available");
        onError?.(error);
        reject(error);
        return;
      }

      console.log(`Using browser's built-in TTS as fallback for ${language} text`);
      
      const utterance = new SpeechSynthesisUtterance(text);
      // Use the language code from our utility
      utterance.lang = languageCodeMap[language?.toLowerCase()] || 'en-US';
      
      utterance.onend = () => {
        onEnd?.();
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error("Browser TTS error:", event);
        const error = new Error(`Browser TTS error: ${event.error}`);
        onError?.(error);
        reject(error);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Error with browser TTS:", err);
      onError?.(new Error(`Browser TTS failed: ${err.message}`));
      reject(err);
    }
  });
};
