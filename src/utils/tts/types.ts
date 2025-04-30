
// TTS options interface
export interface TTSOptions {
  text: string;
  language: string;
  isTargetLanguage?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

// TTS response interface for internal use
export interface TTSCacheEntry {
  audioContent: string;
  timestamp: number;
}

// Browser TTS interface
export interface BrowserTTS {
  isBrowserSupported: boolean;
  speak: (
    text: string,
    language: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ) => Promise<void>;
}
