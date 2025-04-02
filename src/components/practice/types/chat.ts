
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

export interface TranslationResponse {
  content: string;
  translation?: string;
}
