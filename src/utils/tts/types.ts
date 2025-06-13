
export interface TTSOptions {
  text: string;
  language: string;
  useMetaMms?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}
