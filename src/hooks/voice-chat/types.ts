
export interface VoiceChatOptions {
  language?: string;
  onMessage?: (message: VoiceChatMessage) => void;
  onStart?: () => void;
  onEnd?: () => void;
  autoRestart?: boolean;
  silenceTimeout?: number;
}

export interface VoiceChatMessage {
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface VoiceChatSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  language: string;
}

export interface VoiceChatReturn {
  isActive: boolean;
  isSpeaking: boolean;
  startVoiceConversation: () => Promise<{ conversationId: string | null }>;
  endVoiceConversation: () => Promise<boolean>;
  conversation: {
    status: string;
    isSpeaking: boolean;
    startSession: (opts: any) => Promise<string>;
    endSession: () => Promise<boolean>;
  };
  isConversationActive: () => boolean;
  setMessageHandler: (handler: (message: any) => void) => void;
  microphoneAccess: boolean;
}
