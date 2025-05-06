
import { useVoiceChat as useVoiceChatCore } from './voice-chat';

/**
 * Hook for voice chat functionality
 * This is a compatibility wrapper that forwards to the refactored implementation
 */
export const useVoiceChat = () => {
  return useVoiceChatCore();
};
