
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
export const useBrowserTTS = () => {
  return {
    isBrowserSupported: isTTSSupported(),
    speak: (
      text: string, 
      language: string, 
      onStart?: () => void, 
      onEnd?: () => void, 
      onError?: (error: string) => void
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          if (!window.speechSynthesis) {
            const errorMessage = "Browser speech synthesis not available";
            onError?.(errorMessage);
            reject(new Error(errorMessage));
            return;
          }

          console.log(`Using browser's built-in TTS as fallback for ${language} text`);
          
          const utterance = new SpeechSynthesisUtterance(text);
          // Use the language code from our utility
          utterance.lang = languageCodeMap[language?.toLowerCase()] || 'en-US';
          
          utterance.onstart = () => {
            onStart?.();
          };
          
          utterance.onend = () => {
            onEnd?.();
            resolve();
          };
          
          utterance.onerror = (event) => {
            console.error("Browser TTS error:", event);
            const errorMessage = `Browser TTS error: ${event.error}`;
            onError?.(errorMessage);
            reject(new Error(errorMessage));
          };
          
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error("Error with browser TTS:", err);
          const errorMessage = `Browser TTS failed: ${err.message}`;
          onError?.(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    }
  };
};
