
export type VoiceMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type SessionStatus = 'available' | 'active' | 'cooldown';

export type LanguagePair = {
  practice: string;
  native: string;
};

export interface PremiumVoiceChatSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end: string | null;
}
