
import { useSpeechRecognition as useSpeechRecognitionCore } from './speechRecognition';
import { UseSpeechRecognitionOptions, UseSpeechRecognitionReturn } from './speechRecognition/types';

/**
 * Hook for speech recognition functionality
 * This is a compatibility wrapper that forwards to the refactored implementation
 */
export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions
): UseSpeechRecognitionReturn => {
  return useSpeechRecognitionCore(options);
};
