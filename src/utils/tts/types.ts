
// TTS options interface
export interface TTSOptions {
  text: string;
  language: string;
  isTargetLanguage?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

// TTS response interface for internal use
export interface TTSCacheEntry {
  audioContent: string;
  timestamp: number;
}
