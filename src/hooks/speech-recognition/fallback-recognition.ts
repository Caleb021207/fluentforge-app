
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMediaRecording = (
  language: string,
  onTranscriptChange: (transcript: string) => void,
  resetSilenceDetection: () => void
) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [lastTranscriptTime, setLastTranscriptTime] = useState<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startMediaRecording = async () => {
    try {
      console.log("Starting media recording with fallback method for language:", language);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
      // Use MediaRecorder with best available codec
      const options = { mimeType: 'audio/webm' };
      const recorder = new MediaRecorder(stream, options);
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setIsRecording(true);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(currentChunks => [...currentChunks, event.data]);
        }
      };
      
      // Record in shorter chunks for better responsiveness
      recorder.start(2000);
      resetSilenceDetection();
      
      console.log("Media recorder started successfully with language:", language);
      return true;
    } catch (error) {
      console.error("Error starting media recording:", error);
      return false;
    }
  };
  
  const stopMediaRecording = () => {
    if (mediaRecorder && isRecording) {
      try {
        console.log("Stopping media recording");
        mediaRecorder.stop();
        setIsRecording(false);
      } catch (e) {
        console.error("Error stopping media recorder:", e);
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  const processFallbackRecording = async () => {
    if (audioChunks.length === 0) return;
    
    try {
      console.log(`Processing ${audioChunks.length} audio chunks with fallback method for language: ${language}`);
      
      // Don't transcribe too frequently to avoid overwhelming the server
      const now = Date.now();
      if (now - lastTranscriptTime < 1000) {
        console.log("Skipping transcription - too frequent");
        return;
      }
      setLastTranscriptTime(now);
      
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Audio = base64data.split(',')[1];
        
        // Reset chunks for next recording segment
        setAudioChunks([]);
        
        // Send to Supabase function
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { 
            audio: base64Audio,
            language: language.split('-')[0] // Send just the language code (e.g., 'en' from 'en-US')
          }
        });
        
        if (error) {
          console.error("Error transcribing audio:", error);
          return;
        }
        
        if (data && data.text) {
          console.log("Received transcription:", data.text);
          onTranscriptChange(data.text);
          resetSilenceDetection();
        }
      };
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };
  
  return {
    isRecording,
    audioChunks,
    startMediaRecording,
    stopMediaRecording,
    processFallbackRecording,
    setAudioChunks
  };
};
