
export type SessionStatus = 'available' | 'active' | 'cooldown';

export interface MessageCount {
  inputs: number;
  outputs: number;
}

export interface SessionManagementState {
  messageCount: MessageCount;
  isLoggedIn: boolean;
  isLoading: boolean;
  sessionStatus: SessionStatus;
  weeklyTimeRemaining: number | null;
  cooldownTimeRemaining: number | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}
