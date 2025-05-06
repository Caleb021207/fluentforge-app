
import { useVoiceChat as useVoiceChatCore } from './voice-chat';
import { VoiceChatOptions, VoiceChatReturn } from './voice-chat/types';

/**
 * Hook for voice chat functionality
 * This is a compatibility wrapper that forwards to the refactored implementation
 */
export const useVoiceChat = (): VoiceChatReturn => {
  return useVoiceChatCore();
};
