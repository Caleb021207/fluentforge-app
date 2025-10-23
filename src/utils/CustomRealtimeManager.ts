import { supabase } from "@/integrations/supabase/client";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CustomRealtimeResponse {
  userTranscript: string;
  aiResponse: string;
  audioBase64: string;
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
  private stream: MediaStream | null = null;
  private isSessionActive: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  
  // VAD settings
  private readonly SILENCE_THRESHOLD = 0.01;
  private readonly SILENCE_DURATION_MS = 3000;
  private readonly MAX_RECORDING_DURATION_MS = 60000; // 1 minute
  private recordingStartTime: number = 0;

  constructor(
    targetLanguage: string,
    userLanguage: string,
    onStateChange: (state: ConversationState) => void,
    onMessage: (message: { role: string; content: string }) => void,
    onError: (error: string) => void
  ) {
    this.targetLanguage = targetLanguage;
    this.userLanguage = userLanguage;
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
    this.mediaRecorder.start(100); // Capture in 100ms chunks for VAD

    // Setup VAD monitoring
    this.setupVAD();

    // Safety timeout
    setTimeout(() => {
      if (this.state === 'listening') {
        console.log('Max recording duration reached');
        this.stopListening();
      }
    }, this.MAX_RECORDING_DURATION_MS);

    console.log('Started listening...');
  }

  private setupVAD(): void {
    if (!this.audioContext || !this.stream) return;

    const analyser = this.audioContext.createAnalyser();
    const microphone = this.audioContext.createMediaStreamSource(this.stream);
    analyser.fftSize = 2048;
    microphone.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudioLevel = () => {
      if (this.state !== 'listening') return;

      analyser.getByteTimeDomainData(dataArray);
      
      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / bufferLength);

      if (rms < this.SILENCE_THRESHOLD) {
        // Silence detected
        if (!this.silenceTimeout) {
          this.silenceTimeout = setTimeout(() => {
            console.log('Silence detected, stopping recording');
            this.stopListening();
          }, this.SILENCE_DURATION_MS);
        }
      } else {
        // Voice detected, reset timer
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
          this.silenceTimeout = null;
        }
      }

      requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  }

  private stopListening(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
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

      const response = data as CustomRealtimeResponse;
      
      // Add messages to history
      this.conversationHistory.push(
        { role: 'user', content: response.userTranscript },
        { role: 'assistant', content: response.aiResponse }
      );

      // Notify UI
      this.onMessage({ role: 'user', content: response.userTranscript });
      this.onMessage({ role: 'assistant', content: response.aiResponse });

      // Play AI response
      await this.playAudio(response.audioBase64);

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

  private async playAudio(audioBase64: string): Promise<void> {
    this.setState('speaking');

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

      await new Promise<void>((resolve, reject) => {
        if (!this.currentAudio) {
          reject(new Error('Audio element not created'));
          return;
        }
        
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
      });

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
      this.onError('Failed to play audio');
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
