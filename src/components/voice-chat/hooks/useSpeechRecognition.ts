
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

/**
 * Hook for speech recognition functionality
 */
export const useSpeechRecognition = (onTranscriptComplete: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      // Fix language mapping to ensure correct language is set
      recognitionRef.current.lang = currentLanguage === "english" ? "en-US" : 
                                   currentLanguage === "spanish" ? "es-ES" :
                                   currentLanguage === "portuguese" ? "pt-BR" :
                                   currentLanguage === "japanese" ? "ja-JP" : 
                                   currentLanguage === "vietnamese" ? "vi-VN" : "en-US";
                                   
      console.log(`Setting speech recognition language to: ${recognitionRef.current.lang}`);
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        
        console.log("Speech recognized:", currentTranscript);
        setTranscript(currentTranscript);
        
        // Don't automatically send transcript on interim results
        if (event.results[0].isFinal) {
          console.log("Final transcript ready:", currentTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
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
      };
      
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended, isListening state:", isListening);
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
      if (recognitionRef.current) {
        console.log("Speech recognition aborted in cleanup");
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error cleaning up speech recognition:", e);
        }
      }
    };
  }, [currentLanguage, toast, t, onTranscriptComplete]);

  const toggleListening = () => {
    if (isListening) {
      console.log("Stopping speech recognition");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          // Transcript will be sent in the onend handler
        } catch (error) {
          console.error("Error stopping speech recognition:", error);
        }
      }
    } else {
      console.log("Starting speech recognition");
      if (recognitionRef.current) {
        try {
          setTranscript(""); // Clear previous transcript
          recognitionRef.current.start();
        } catch (error) {
          console.error("Error starting speech recognition:", error);
          toast({
            title: t("error"),
            description: t("microphoneAccessRequired"),
            variant: "destructive",
          });
        }
      }
    }
  };

  return {
    isListening,
    transcript,
    toggleListening,
    setTranscript
  };
};
