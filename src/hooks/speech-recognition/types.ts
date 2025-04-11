
export interface SpeechRecognitionOptions {
  onTranscriptChange: (transcript: string) => void;
  onSilence?: () => void;
  onError?: (errorMessage: string) => void;
  silenceTimeout?: number;
  language?: string;
}

export interface SpeechRecognitionResult {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  usingFallback: boolean;
  transcript?: string;
}
