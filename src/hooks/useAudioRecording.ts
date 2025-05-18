
import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface UseAudioRecordingProps {
  onRecordingComplete?: (base64Audio: string) => void;
}

export const useAudioRecording = ({ onRecordingComplete }: UseAudioRecordingProps = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);  // Add this line
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const [base64Audio, setBase64Audio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  // Cleanup function for media resources
  const cleanupMediaResources = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMediaResources();
    };
  }, [cleanupMediaResources]);

  // Convert blob to base64
  const convertToBase64 = useCallback(async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(false);
      setAudioBlobs([]);
      setBase64Audio(null);
      setIsInitializing(true);  // Add this line to set initializing state

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          setIsProcessing(true);
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          setAudioBlobs([audioBlob]);
          
          const base64 = await convertToBase64(audioBlob);
          setBase64Audio(base64);
          
          if (onRecordingComplete) {
            onRecordingComplete(base64);
          }
        } catch (err) {
          console.error("Error processing recording:", err);
          setError("Failed to process recording");
          toast({
            title: t("error"),
            description: t("failedToProcessRecording"),
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
          setIsInitializing(false);  // Make sure to reset initializing state
          cleanupMediaResources();
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsInitializing(false);  // Set initializing to false once recording starts
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to access microphone");
      setIsInitializing(false);  // Reset initializing on error
      toast({
        title: t("microphoneAccessRequired"),
        description: t("allowMicAccess"),
        variant: "destructive",
      });
      cleanupMediaResources();
    }
  }, [cleanupMediaResources, convertToBase64, onRecordingComplete, t, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    isProcessing,
    isInitializing,  // Add this to the returned object
    audioBlobs,
    base64Audio,
    error,
    startRecording,
    stopRecording
  };
};
