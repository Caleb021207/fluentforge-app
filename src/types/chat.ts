
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
};

export type MessageCount = {
  inputs: number;
  outputs: number;
};
