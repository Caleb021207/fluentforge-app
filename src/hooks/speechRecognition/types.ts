
export interface UseSpeechRecognitionOptions {
  language: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  autoRestart?: boolean;
  audioDevice?: string; // Optional device ID for input
  silenceTimeout?: number; // Time in ms to wait before considering silence
  disableAutoStop?: boolean; // Option to disable auto-stopping
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  requestMicrophoneAccess: () => Promise<boolean>;
  availableDevices: MediaDeviceInfo[];
}
