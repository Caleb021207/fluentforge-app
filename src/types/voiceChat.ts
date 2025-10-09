
import { TranslationType } from "@/components/practice/hooks/translation/types";
import { Message } from "@/types/chat";

export interface VoiceChatHeaderProps {
  // Currently empty, but can be extended with title customization, etc.
}

export interface VoiceRecognitionControlsProps {
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  transcript: string;
  toggleListening: () => void;
  handleSendTranscript: (text: string) => void;
}

export interface PracticeInfoPanelProps {
  // Currently empty, but can be extended with level, language info customization
}

export interface TranscriptDisplayProps {
  transcript: string;
  isListening: boolean;
}

export interface ListeningIndicatorProps {
  isListening: boolean;
}

export interface VoiceChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  targetLanguage: string;
  onPlayAudio?: (text: string) => void;
  sessionId?: string;
}

export interface VoiceChatControlsProps {
  conversationHistory: Message[];
  apiConversationHistory: Message[];
  sessionIdRef: React.MutableRefObject<string | null>;
  clearConversation: () => void;
  analyzeCurrentConversation: () => void;
  practice: string;
  isAnalyzing?: boolean;
}

export interface ConversationStartersProps {
  onPhraseClick: (phrase: string) => void;
  phrases?: string[];
  targetLanguage?: string;
}

export interface InformationCardProps {
  // Currently empty, but can be extended with custom content
}

export interface VoiceChatProps {
  // Main component props, if needed for customization
}
