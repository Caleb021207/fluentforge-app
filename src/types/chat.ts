
export type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};
