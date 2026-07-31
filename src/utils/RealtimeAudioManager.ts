import { supabase } from "@/integrations/supabase/client";
import { resolveRealtimeModel } from "@/utils/realtimeModel";

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

const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
  const int16Data = new Int16Array(pcmData.length / 2);
  for (let i = 0; i < pcmData.length; i += 2) {
    int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
  }
  
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + int16Data.byteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, int16Data.byteLength, true);

  const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
  wavArray.set(new Uint8Array(wavHeader), 0);
  wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
  
  return wavArray;
};

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
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
      const arrayBuffer = new ArrayBuffer(wavData.buffer.byteLength);
      new Uint8Array(arrayBuffer).set(new Uint8Array(wavData.buffer));
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
}

let audioQueueInstance: AudioQueue | null = null;

export const playAudioData = async (audioContext: AudioContext, audioData: Uint8Array) => {
  if (!audioQueueInstance) {
    audioQueueInstance = new AudioQueue(audioContext);
  }
  await audioQueueInstance.addToQueue(audioData);
};

/** Learner personalization sent at token-mint time (wip-11a D4). */
export interface RealtimeInitOptions {
  cefrLevel?: string;
  userLanguage?: string;
  targetLanguage?: string;
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private sessionStartTime: number = 0;
  private localStream: MediaStream | null = null;

  constructor(
    private onMessage: (message: any) => void,
    private onSpeakingChange: (speaking: boolean) => void,
    private onDisconnect?: (reason: string) => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init(options: RealtimeInitOptions = {}) {
    try {
      console.log("🚀 Getting ephemeral token...");
      
      // Get ephemeral token from edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // D2 fix (wip-11a, 2026-07-30): mint the token from THIS project's
      // endpoint (this previously pointed at a hardcoded foreign project URL,
      // dukpljcweixxmpkiblwo). Plain fetch so non-2xx bodies (e.g. the 403
      // monthly-limit message) surface to the learner instead of a generic
      // invoke error.
      // D4: send proficiency in the body — the server prefers its own
      // profile read and uses these values as fallback only.
      const mintResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/premium-voice-realtime`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cefrLevel: options.cefrLevel,
            userLanguage: options.userLanguage,
            targetLanguage: options.targetLanguage,
          }),
        }
      );

      if (!mintResponse.ok) {
        const errorBody = await mintResponse.json().catch(() => null);
        throw new Error(errorBody?.error || `Failed to get token (${mintResponse.status})`);
      }

      const data = await mintResponse.json();

      if (!data?.client_secret?.value) {
        throw new Error("No token received");
      }

      const token = data.client_secret.value;
      this.sessionStartTime = data.session_start;
      console.log("✅ Token received");

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Resilience (wip-11a D5): if the connection dies, clean up and tell
      // the UI so it never hangs in a dead session.
      this.pc.onconnectionstatechange = () => {
        const state = this.pc?.connectionState;
        if (state === 'failed' || state === 'disconnected') {
          console.warn('⚠️ Realtime connection lost:', state);
          this.disconnect();
          this.onDisconnect?.(state);
        }
      };

      // Set up audio playback
      this.pc.ontrack = (e) => {
        console.log("🎵 Audio track received");
        this.audioEl.srcObject = e.streams[0];
      };

      // Add local audio track
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 24000, 
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      this.localStream = stream;
      this.pc.addTrack(stream.getTracks()[0]);

      // Set up data channel for events
      this.dc = this.pc.createDataChannel("oai-events");

      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("📨 Event:", event.type);

        if (event.type === 'response.audio.delta') {
          this.onSpeakingChange(true);
        } else if (event.type === 'response.audio.done') {
          this.onSpeakingChange(false);
        }

        this.onMessage(event);
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Exchange SDP with OpenAI.
      // D3 fix (wip-11a, 2026-07-30): the SDP exchange previously pinned
      // gpt-4o-realtime-preview-2024-12-17 while the mint pinned
      // gpt-realtime-2025-08-28. The minted session's model is authoritative;
      // the shared constant in realtimeModel.ts is the fallback.
      const model = resolveRealtimeModel(data.model);
      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`,
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/sdp"
          },
        }
      );

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      await this.pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      console.log("✅ WebRTC connected");
    } catch (error) {
      console.error('Error initializing:', error);
      throw error;
    }
  }

  async getSessionDuration(): Promise<number> {
    if (!this.sessionStartTime) return 0;
    return Math.ceil((Date.now() - this.sessionStartTime) / 1000 / 60); // minutes
  }

  disconnect() {
    // Clear the state handler first so an intentional close never fires
    // the connection-lost path.
    if (this.pc) {
      this.pc.onconnectionstatechange = null;
    }
    this.dc?.close();
    this.pc?.close();
    this.dc = null;
    this.pc = null;
    this.localStream?.getTracks().forEach(track => track.stop());
    this.localStream = null;
    this.audioEl.srcObject = null;
  }
}
