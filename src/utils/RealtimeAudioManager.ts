import { supabase } from "@/integrations/supabase/client";

// Audio encoding utility
export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

// WAV conversion utility
const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
  const int16Data = new Int16Array(pcmData.length / 2);
  for (let i = 0; i < pcmData.length; i += 2) {
    int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
  }
  
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + int16Data.byteLength, true);
  view.setUint32(8, 0x57415645, false);
  
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, int16Data.byteLength, true);
  
  const wavArray = new Uint8Array(44 + int16Data.byteLength);
  wavArray.set(new Uint8Array(wavHeader), 0);
  wavArray.set(new Uint8Array(int16Data.buffer), 44);
  
  return wavArray;
};

// Audio queue for sequential playback
class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;
  private buffer: Uint8Array[] = [];
  private bufferThreshold = 9600; // 200ms at 24kHz, 16-bit

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  addChunk(audioData: Uint8Array) {
    this.buffer.push(audioData);
    
    const totalBuffered = this.buffer.reduce((sum, chunk) => sum + chunk.length, 0);
    
    if (totalBuffered >= this.bufferThreshold) {
      const combined = new Uint8Array(totalBuffered);
      let offset = 0;
      for (const chunk of this.buffer) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      
      this.queue.push(combined);
      this.buffer = [];
      
      if (!this.isPlaying) {
        this.playNext();
      }
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = createWavFromPCM(audioData);
      const arrayBuffer = wavData.buffer.slice(0) as ArrayBuffer;
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  flush() {
    if (this.buffer.length > 0) {
      const totalBuffered = this.buffer.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalBuffered);
      let offset = 0;
      for (const chunk of this.buffer) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      this.queue.push(combined);
      this.buffer = [];
      
      if (!this.isPlaying) {
        this.playNext();
      }
    }
  }

  clear() {
    this.queue = [];
    this.buffer = [];
    this.isPlaying = false;
  }
}

// Audio recorder class
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Main RealtimeChat class
export class RealtimeChat {
  private ws: WebSocket | null = null;
  private audioRecorder: AudioRecorder | null = null;
  private audioQueue: AudioQueue;
  private audioContext: AudioContext;
  private nativeLanguage: string;
  private targetLanguage: string;
  private sessionStartTime: number = 0;
  private sequenceCounter = 0;
  private pendingUserMessageIndex: number | null = null;
  private messages: any[] = [];

  constructor(
    private onMessage: (message: any) => void,
    private onSpeakingChange: (speaking: boolean) => void,
    nativeLanguage: string = 'english',
    targetLanguage: string = 'english'
  ) {
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    this.audioQueue = new AudioQueue(this.audioContext);
    this.nativeLanguage = nativeLanguage;
    this.targetLanguage = targetLanguage;
  }

  async init() {
    try {
      this.sessionStartTime = Date.now();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const wsUrl = `wss://dukpljcweixxmpkiblwo.supabase.co/functions/v1/realtime-chat?nativeLanguage=${this.nativeLanguage}&targetLanguage=${this.targetLanguage}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.startAudioRecording();
      };

      this.ws.onmessage = this.handleMessage;

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        throw new Error("WebSocket connection failed");
      };

      this.ws.onclose = () => {
        console.log("WebSocket closed");
        this.cleanup();
      };

    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  private startAudioRecording() {
    this.audioRecorder = new AudioRecorder((audioData) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const encoded = encodeAudioForAPI(audioData);
        this.ws.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: encoded
        }));
      }
    });

    this.audioRecorder.start().catch(error => {
      console.error("Error starting audio recording:", error);
    });
  }

  private handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    console.log("Received:", data.type);

    switch (data.type) {
      case 'session.created':
        console.log("Session created successfully");
        break;

      case 'session.updated':
        console.log("Session configuration updated");
        break;

      case 'response.created':
        const userSequence = this.sequenceCounter++;
        this.pendingUserMessageIndex = this.messages.length;
        this.messages.push({
          role: 'user',
          text: '[Transcribing...]',
          sequence: userSequence
        });
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (this.pendingUserMessageIndex !== null) {
          this.messages[this.pendingUserMessageIndex] = {
            ...this.messages[this.pendingUserMessageIndex],
            text: data.transcript
          };
          this.pendingUserMessageIndex = null;
        }
        break;

      case 'response.audio.delta':
        const binaryString = atob(data.delta);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        this.audioQueue.addChunk(bytes);
        this.onSpeakingChange(true);
        break;

      case 'response.audio.done':
        this.audioQueue.flush();
        this.onSpeakingChange(false);
        break;

      case 'response.audio_transcript.delta':
        const lastMsg = this.messages[this.messages.length - 1];
        if (lastMsg?.role === 'assistant' && lastMsg.responseId === data.response_id) {
          lastMsg.text += data.delta;
        } else {
          this.messages.push({
            role: 'assistant',
            text: data.delta,
            sequence: this.sequenceCounter++,
            responseId: data.response_id
          });
        }
        break;

      case 'error':
        console.error("OpenAI error:", data);
        break;
    }

    this.onMessage({ ...data, messages: this.messages });
  };

  async sendMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(event));
    this.ws.send(JSON.stringify({type: 'response.create'}));
  }

  private cleanup() {
    this.audioRecorder?.stop();
    this.audioQueue.clear();
  }

  disconnect() {
    const minutesUsed = Math.ceil((Date.now() - this.sessionStartTime) / 60000);
    console.log(`Session ended. Minutes used: ${minutesUsed}`);
    
    this.cleanup();
    this.ws?.close();
  }
}
