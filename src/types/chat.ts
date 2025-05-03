
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}
