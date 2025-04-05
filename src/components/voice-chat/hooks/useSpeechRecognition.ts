
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

/**
 * Hook for speech recognition functionality with silence detection
 */
export const useSpeechRecognition = (onTranscriptComplete: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  // Clear silence timer
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Set up silence detection - if no speech detected for 10 seconds, submit
  const resetSilenceTimer = () => {
    clearSilenceTimer();
    
    silenceTimerRef.current = window.setTimeout(() => {
      console.log("Silence detected for 10 seconds, stopping recognition");
      if (isListening && recognitionRef.current) {
        stopListening();
      }
    }, 10000);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      // Set the correct language for speech recognition
      recognitionRef.current.lang = currentLanguage === "english" ? "en-US" : 
                                   currentLanguage === "spanish" ? "es-ES" :
                                   currentLanguage === "portuguese" ? "pt-BR" :
                                   currentLanguage === "japanese" ? "ja-JP" : 
                                   currentLanguage === "vietnamese" ? "vi-VN" :
                                   currentLanguage === "russian" ? "ru-RU" : "en-US";
                                   
      console.log(`Setting speech recognition language to: ${recognitionRef.current.lang}`);
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(" ");
        
        console.log("Speech recognized:", currentTranscript);
        setTranscript(currentTranscript);
        
        // Reset silence timer when speech is detected
        resetSilenceTimer();
        
        // If final result is available for any result, update the transcript
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            console.log("Final result detected, continuing to listen");
          }
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        clearSilenceTimer();
        setIsListening(false);
        toast({
          title: t("error"),
          description: `${t("speechRecognitionError")}: ${event.error}`,
          variant: "destructive",
        });
      };
      
      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started successfully");
        setIsListening(true);
        resetSilenceTimer();
      };
      
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended, isListening state:", isListening);
        clearSilenceTimer();
        setIsListening(false);
        
        // If we have a transcript when recognition ends, send it to the callback
        if (transcript && transcript.trim().length > 0) {
          console.log("Sending final transcript on recognition end:", transcript);
          onTranscriptComplete(transcript);
        }
      };
    } else {
      console.error("Speech recognition not supported in this browser");
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
    }

    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        console.log("Speech recognition aborted in cleanup");
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error cleaning up speech recognition:", e);
        }
      }
    };
  }, [currentLanguage, toast, t, onTranscriptComplete, transcript]);

  const startListening = () => {
    console.log("Starting speech recognition");
    if (recognitionRef.current) {
      try {
        setTranscript(""); // Clear previous transcript
        recognitionRef.current.start();
        resetSilenceTimer();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast({
          title: t("error"),
          description: t("microphoneAccessRequired"),
          variant: "destructive",
        });
      }
    }
  };

  const stopListening = () => {
    console.log("Stopping speech recognition");
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        // Transcript will be sent in the onend handler
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    setTranscript
  };
};
