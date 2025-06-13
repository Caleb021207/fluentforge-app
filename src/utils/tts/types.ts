
export interface TTSOptions {
  text: string;
  language: string;
  speechRate?: number;
  useMetaMms?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}
