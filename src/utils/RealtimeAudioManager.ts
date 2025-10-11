import { supabase } from "@/integrations/supabase/client";

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

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private nativeLanguage: string;
  private targetLanguage: string;
  private sessionStartTime: number = 0;

  constructor(
    private onMessage: (message: any) => void,
    private onSpeakingChange: (speaking: boolean) => void,
    nativeLanguage: string = 'english',
    targetLanguage: string = 'english'
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
    this.nativeLanguage = nativeLanguage;
    this.targetLanguage = targetLanguage;
  }

  async init() {
    try {
      this.sessionStartTime = Date.now();
      
      // Get ephemeral token from our Supabase Edge Function
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke("get-realtime-token", {
        body: { 
          nativeLanguage: this.nativeLanguage,
          targetLanguage: this.targetLanguage 
        }
      });

      if (tokenError || !tokenData?.client_secret?.value) {
        throw new Error(tokenError?.message || "Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = tokenData.client_secret.value;
      console.log("Got ephemeral token");

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up remote audio
      this.pc.ontrack = e => {
        console.log("Received remote audio track");
        this.audioEl.srcObject = e.streams[0];
      };

      // Add local audio track
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);
      console.log("Added local audio track");

      // Set up data channel
      this.dc = this.pc.createDataChannel("oai-events");
      
      this.dc.addEventListener("open", () => {
        console.log("Data channel opened");
      });

      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event.type);
        
        if (event.type === 'response.audio_transcript.delta' || 
            event.type === 'conversation.item.input_audio_transcription.completed') {
          console.log("Transcript:", event.delta || event.transcript);
        }
        
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
      console.log("Created offer");

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect: ${await sdpResponse.text()}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  async sendMessage(text: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      throw new Error('Data channel not ready');
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

    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({type: 'response.create'}));
  }

  disconnect() {
    const minutesUsed = Math.ceil((Date.now() - this.sessionStartTime) / 60000);
    console.log(`Session ended. Minutes used: ${minutesUsed}`);
    
    this.dc?.close();
    this.pc?.close();
    this.audioEl.srcObject = null;
  }
}
