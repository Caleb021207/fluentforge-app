
export type SessionStatus = 'available' | 'loading' | 'active' | 'cooldown' | 'ended';

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

// Alias for compatibility with existing code
export type Message = ChatMessage;

// Add interfaces needed for components
export interface ProgressChartProps {
  progressData: any[];
}

export interface RecentAttemptsCardProps {
  attempts: any[];
  hasTranscript: Record<string, boolean>;
  onViewAttempt: (attemptId: string) => Promise<void>;
}

export interface LanguageSelectionCardProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  getNativeLanguageName: (language: string) => string;
}
