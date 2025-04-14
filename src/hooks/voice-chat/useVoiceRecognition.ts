import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { initAzureSpeechToText } from "@/utils/azureSpeechUtils";

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] useState("");
  const recognizerRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  useEffect(() => {
    try {
      if (isListening) {
        const recognizer = initAzureSpeechToText(currentLanguage);
        recognizerRef.current = recognizer;
        
        recognizer.startRecognition()
          .then((text: string) => {
            if (text) {
              setTranscript(text);
              resetSilenceDetection();
            }
          })
          .catch((error: Error) => {
            console.error("Speech recognition error:", error);
            setIsListening(false);
            toast({
              title: t("error"),
              description: `${t("speechRecognitionError")}: ${error.message}`,
              variant: "destructive",
            });
          });
      } else if (recognizerRef.current) {
        recognizerRef.current.stopRecognition();
      }
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      toast({
        title: t("error"),
        description: t("speechRecognitionError"),
        variant: "destructive",
      });
    }

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopRecognition();
      }
      clearSilenceDetection();
    };
  }, [currentLanguage, isListening, toast, t]);

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    silenceTimeoutRef.current = window.setTimeout(() => {
      if (transcript && isListening) {
        console.log("10 seconds of silence detected");
        if (recognizerRef.current) {
          recognizerRef.current.abort();
        }
        setIsListening(false);
      }
    }, 10000);
  };

  const clearSilenceDetection = () => {
    if (silenceTimeoutRef.current !== null) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      if (recognizerRef.current) {
        await recognizerRef.current.stopRecognition();
      }
      clearSilenceDetection();
      setIsListening(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsListening(true);
        setTranscript("");
        resetSilenceDetection();
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({
          title: t("error"),
          description: t("microphoneAccessRequired"),
          variant: "destructive",
        });
      }
    }
  };

  return {
    isListening,
    transcript,
    toggleListening,
    setTranscript,
    clearSilenceDetection
  };
};
