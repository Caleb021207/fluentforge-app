
export interface TTSOptions {
  text: string;
  language: string;
  speechRate?: number;
  voice?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}
