// Audio encoding utility - converts Float32Array to base64 PCM16
export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  // Convert Float32 samples to Int16 PCM
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  // Convert to Uint8Array for base64 encoding
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

// WAV conversion - wraps PCM16 data in WAV header
export const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
  // Convert bytes to 16-bit samples (little-endian)
  const int16Data = new Int16Array(pcmData.length / 2);
  for (let i = 0; i < pcmData.length; i += 2) {
    int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
  }
  
  // Create WAV header (44 bytes)
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  
  // RIFF chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + int16Data.byteLength, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  // fmt sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  
  // data sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, int16Data.byteLength, true);
  
  // Combine header + data
  const wavArray = new Uint8Array(44 + int16Data.byteLength);
  wavArray.set(new Uint8Array(wavHeader), 0);
  wavArray.set(new Uint8Array(int16Data.buffer), 44);
  
  return wavArray;
};

// Audio queue for sequential playback with buffering
export class AudioQueue {
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
    
    // Only queue when we have enough buffered
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
      console.error('❌ Audio playback error:', error);
      this.playNext(); // Continue with next chunk
    }
  }

  flush() {
    // Play any remaining buffered data
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
      console.log("🎤 Requesting microphone access...");
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log("✅ Microphone access granted");
      
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      console.log("✅ Audio recording started");
    } catch (error) {
      console.error('❌ Microphone error:', error);
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
    console.log("🛑 Audio recording stopped");
  }
}
