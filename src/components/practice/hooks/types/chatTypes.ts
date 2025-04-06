
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

export interface UseChatMessagesResult {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  sendLanguageLearningPrompt: () => void;
  handleSendPrompt: (promptText: string) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  getPlaceholderText: () => string;
}
