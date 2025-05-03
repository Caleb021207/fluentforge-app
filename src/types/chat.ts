
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

export interface MessageCount {
  inputs: number;
  outputs: number;
}

export type SessionStatus = "available" | "active" | "loading" | "cooldown";
