
export interface TTSOptions {
  text: string;
  language: string; 
  isTargetLanguage?: boolean;
  useMetaMms?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}
