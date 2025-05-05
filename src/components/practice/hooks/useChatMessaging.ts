
import { useChatMessaging as useRefactoredChatMessaging } from "./messaging";

export type { ChatResponse } from "./messaging";

// This is a wrapper around the refactored useChatMessaging to maintain compatibility
export const useChatMessaging = () => {
  return useRefactoredChatMessaging();
};
