import { supabase } from "@/integrations/supabase/client";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AudioSegment {
  lang: string;
  text: string;
  audio: string;
}

interface CustomRealtimeResponse {
  userTranscript: string;
  aiResponse: string;
  audioSegments?: AudioSegment[];
  audioBase64?: string;
  audioFormat: string;
}

type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';

export class CustomRealtimeManager {
  private state: ConversationState = 'idle';
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private silenceTimeout: NodeJS.Timeout | null = null;
  private conversationHistory: ConversationMessage[] = [];
  private onStateChange: (state: ConversationState) => void;
  private onMessage: (message: { role: string; content: string }) => void;
  private onError: (error: string) => void;
  private targetLanguage: string;
  private userLanguage: string;
  private userInterfaceLanguage: string;
  private proficiencyLevel: string;
  private stream: MediaStream | null = null;
  private isSessionActive: boolean = false;
  private isDisconnecting: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  
  // Word-based VAD settings
  private readonly SILENCE_AFTER_LAST_WORD_MS = 3000;
  private readonly MAX_RECORDING_DURATION_MS = 60000; // 1 minute
  private recordingStartTime: number = 0;
  private lastWordTimestamp: number = 0;
  private vadRecognition: any = null; // SpeechRecognition for VAD only

  constructor(
    targetLanguage: string,
    userLanguage: string,
    userInterfaceLanguage: string,
    proficiencyLevel: string,
    onStateChange: (state: ConversationState) => void,
    onMessage: (message: { role: string; content: string }) => void,
    onError: (error: string) => void
  ) {
    this.targetLanguage = targetLanguage;
    this.userLanguage = userLanguage;
    this.userInterfaceLanguage = userInterfaceLanguage;
    this.proficiencyLevel = proficiencyLevel;
    this.onStateChange = onStateChange;
    this.onMessage = onMessage;
    this.onError = onError;
  }

  async initialize(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.isSessionActive = true;
      console.log('CustomRealtimeManager initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.onError('Microphone access denied or unavailable');
      throw new Error('Microphone access denied or unavailable');
    }
  }

  async startListening(): Promise<void> {
    if (!this.isSessionActive || !this.stream) {
      console.warn('Cannot start listening - session not active or no stream');
      return;
    }
    
    if (this.state === 'listening') {
      console.warn('Already listening');
      return;
    }

    this.setState('listening');
    this.audioChunks = [];
    this.recordingStartTime = Date.now();
    this.lastWordTimestamp = 0;

    // Create MediaRecorder
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = async () => {
      await this.processRecording();
    };

    // Start recording
    this.mediaRecorder.start(100); // Capture in 100ms chunks

    // Setup word-based VAD monitoring
    this.setupWordBasedVAD();

    // Safety timeout
    setTimeout(() => {
      if (this.state === 'listening') {
        console.log('Max recording duration reached');
        this.stopListening();
      }
    }, this.MAX_RECORDING_DURATION_MS);

    console.log('Started listening...');
  }

  private setupWordBasedVAD(): void {
    // Use Web Speech API for word detection (VAD only, not for transcription)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported, falling back to timer-based stop');
      // Fallback: just use a longer timeout
      setTimeout(() => {
        if (this.state === 'listening') {
          console.log('Timeout reached, stopping recording');
          this.stopListening();
        }
      }, 15000); // 15 seconds max
      return;
    }

    this.vadRecognition = new SpeechRecognition();
    this.vadRecognition.continuous = true;
    this.vadRecognition.interimResults = true;
    this.vadRecognition.lang = 'en-US';

    this.vadRecognition.onresult = (event: any) => {
      // Word detected! Update timestamp
      const now = Date.now();
      this.lastWordTimestamp = now;
      
      console.log('Word detected at:', now);

      // Clear any existing silence timeout
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }

      // Start new silence timeout
      this.silenceTimeout = setTimeout(() => {
        const timeSinceLastWord = Date.now() - this.lastWordTimestamp;
        console.log(`No words for ${timeSinceLastWord}ms, stopping recording`);
        this.stopListening();
      }, this.SILENCE_AFTER_LAST_WORD_MS);
    };

    this.vadRecognition.onerror = (event: any) => {
      // Ignore errors, this is just for VAD
      console.log('VAD recognition error (non-critical):', event.error);
    };

    this.vadRecognition.onend = () => {
      // Restart if still listening
      if (this.state === 'listening' && this.vadRecognition) {
        try {
          this.vadRecognition.start();
        } catch (e) {
          // Ignore if already started
        }
      }
    };

    try {
      this.vadRecognition.start();
      console.log('Word-based VAD started');
    } catch (error) {
      console.warn('Could not start VAD recognition:', error);
    }
  }

  private stopListening(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    if (this.vadRecognition) {
      try {
        this.vadRecognition.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      this.vadRecognition = null;
    }
  }

  private async processRecording(): Promise<void> {
    if (this.audioChunks.length === 0) {
      console.warn('No audio chunks to process');
      if (this.isSessionActive) {
        await this.startListening();
      } else {
        this.setState('idle');
      }
      return;
    }

    this.setState('processing');

    try {
      // Combine audio chunks
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      console.log('Sending audio to backend...');

      // Call edge function
      const { data, error } = await supabase.functions.invoke('custom-realtime-conversation', {
        body: {
          audio: audioBase64,
          conversationHistory: this.conversationHistory,
          targetLanguage: this.targetLanguage,
          userLanguage: this.userLanguage,
          userInterfaceLanguage: this.userInterfaceLanguage,
          proficiencyLevel: this.proficiencyLevel,
        }
      });

      if (error) {
        console.error('Backend error:', error);
        this.onError('Failed to process audio. Please try again.');
        if (this.isSessionActive) {
          await this.startListening();
        } else {
          this.setState('idle');
        }
        return;
      }

      const response = data as CustomRealtimeResponse & { ttsMinutesUsed?: number };
      
      // Add messages to history
      this.conversationHistory.push(
        { role: 'user', content: response.userTranscript },
        { role: 'assistant', content: response.aiResponse }
      );

      // Notify UI
      this.onMessage({ role: 'user', content: response.userTranscript });
      this.onMessage({ role: 'assistant', content: response.aiResponse });

      // Track TTS usage
      if (response.ttsMinutesUsed && response.ttsMinutesUsed > 0) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.rpc('increment_tts_usage', {
              p_student_id: user.id,
              p_minutes: response.ttsMinutesUsed
            });
            console.log(`Tracked ${response.ttsMinutesUsed} TTS minute(s) for user ${user.id}`);
          }
        } catch (error) {
          console.error('Failed to track TTS usage:', error);
        }
      }

      // Play AI response (supports both single audio and segments)
      if (response.audioSegments && response.audioSegments.length > 0) {
        await this.playAudioSegments(response.audioSegments);
      } else if (response.audioBase64) {
        await this.playAudio(response.audioBase64);
      }

    } catch (error) {
      console.error('Error processing recording:', error);
      this.onError(error instanceof Error ? error.message : 'Unknown error occurred');
      if (this.isSessionActive) {
        await this.startListening();
      } else {
        this.setState('idle');
      }
    }
  }

  private async playAudioSegments(segments: AudioSegment[]): Promise<void> {
    this.setState('speaking');

    try {
      // Play each segment sequentially
      for (const segment of segments) {
        // Check if session is still active before playing each segment
        if (!this.isSessionActive || this.isDisconnecting) {
          console.log('Session ended, stopping audio playback');
          return;
        }
        
        console.log(`Playing audio segment (${segment.lang}): "${segment.text.substring(0, 30)}..."`);
        await this.playAudioSegment(segment.audio);
      }

      console.log('All audio segments played');
      
      // Auto-continue: start listening again if session is active
      if (this.isSessionActive) {
        console.log('Auto-continuing conversation...');
        await this.startListening();
      } else {
        this.setState('idle');
      }

    } catch (error) {
      console.error('Error playing audio segments:', error);
      // Only show error if not disconnecting
      if (!this.isDisconnecting && this.isSessionActive) {
        this.onError('Failed to play audio');
      }
      if (this.isSessionActive) {
        await this.startListening();
      } else {
        this.setState('idle');
      }
    }
  }

  private async playAudioSegment(audioBase64: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        // Decode base64 to audio buffer
        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create audio element and play
        const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.currentAudio = new Audio(audioUrl);

        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          resolve();
        };
        
        this.currentAudio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(error);
        };
        
        this.currentAudio.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async playAudio(audioBase64: string): Promise<void> {
    this.setState('speaking');

    try {
      await this.playAudioSegment(audioBase64);
      
      console.log('Audio playback completed');
      
      // Auto-continue: start listening again if session is active
      if (this.isSessionActive) {
        console.log('Auto-continuing conversation...');
        await this.startListening();
      } else {
        this.setState('idle');
      }

    } catch (error) {
      console.error('Error playing audio:', error);
      // Only show error if not disconnecting
      if (!this.isDisconnecting && this.isSessionActive) {
        this.onError('Failed to play audio');
      }
      if (this.isSessionActive) {
        await this.startListening();
      } else {
        this.setState('idle');
      }
    }
  }

  private setState(newState: ConversationState): void {
    this.state = newState;
    this.onStateChange(newState);
    console.log(`State changed to: ${newState}`);
  }

  getState(): ConversationState {
    return this.state;
  }

  clearHistory(): void {
    this.conversationHistory = [];
    console.log('Conversation history cleared');
  }

  disconnect(): void {
    this.isDisconnecting = true;
    this.isSessionActive = false;
    this.stopListening();
    
    // Stop currently playing audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
      console.log('Stopped playing audio');
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.setState('idle');
    console.log('CustomRealtimeManager disconnected');
  }
}
