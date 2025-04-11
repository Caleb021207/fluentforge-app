
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { playTTS } from "@/utils/ttsUtils";
import { supabase } from "@/integrations/supabase/client";
import { getLanguagePair } from "@/utils/languageUtils";

export const useVoiceChatRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const targetLanguage = localStorage.getItem("targetLanguage");

  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      let recognitionLanguage = "en-US";
      
      if (currentLanguage === "english") {
        if (targetLanguage === "french") {
          recognitionLanguage = "fr-FR";
        } else {
          recognitionLanguage = "es-ES"; // Default to Spanish if not French
        }
      } else if (currentLanguage === "japanese") {
        recognitionLanguage = "en-US";
      } else {
        recognitionLanguage = "en-US";
      }
      
      recognitionRef.current.lang = recognitionLanguage;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const latestTranscript = event.results[lastResultIndex][0].transcript;
        
        resetSilenceDetection();
        
        setTranscript(latestTranscript);
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
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Failed to restart speech recognition:", e);
          }
        } else {
          setIsListening(false);
        }
      };
    } else {
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearSilenceDetection();
    };
  }, [currentLanguage, targetLanguage, toast, t, isListening]);

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    silenceTimeoutRef.current = window.setTimeout(() => {
      if (transcript && isListening) {
        console.log("10 seconds of silence detected, automatically sending message");
        handleSendTranscript(transcript);
        
        if (recognitionRef.current) {
          recognitionRef.current.abort();
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

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearSilenceDetection();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setTranscript("");
          setGptResponse("");
          setTranslation("");
          resetSilenceDetection();
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

  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    clearSilenceDetection();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          userLanguage: currentLanguage,
          conversationHistory: apiConversationHistory,
          cefrLevel: 'B1',
          requestTranslation: true // Explicitly request translation
        }
      });

      if (error) throw error;
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
      if (!translationText && currentLanguage === "hindi") {
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: content,
              userLanguage: currentLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translationText = translationData.translation;
            console.log("Got Hindi translation:", translationText);
          }
        } catch (translationError) {
          console.error("Failed to get Hindi translation:", translationError);
        }
      }
      
      setGptResponse(content);
      setTranslation(translationText);
      
      setApiConversationHistory(data.updatedHistory || [
        ...apiConversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ]);
      
      speakWithBrowserSynthesis(content);
      setTranscript("");
    } catch (error) {
      console.error('Error getting GPT response:', error);
      toast({
        title: t("error"),
        description: t("failedToGetResponse"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    
    return { content: text };
  };

  const speakWithBrowserSynthesis = (text: string) => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speakWithBrowserSynthesis');
      return;
    }

    console.log(`Speaking text: "${text.substring(0, 50)}..."`);
    
    const { practice } = getLanguagePair(currentLanguage, targetLanguage || undefined);
    const practiceLanguage = practice.toLowerCase();
    
    setIsSpeaking(true);
    
    playTTS({
      text: text,
      language: practiceLanguage,
      onStart: () => {
        console.log("TTS started");
        setIsSpeaking(true);
      },
      onEnd: () => {
        console.log("TTS ended");
        setIsSpeaking(false);
      },
      onError: (error) => {
        console.error("TTS error:", error);
        setIsSpeaking(false);
        toast({
          title: t("error"),
          description: t("failedToGenerateSpeech"),
          variant: "destructive",
        });
      }
    });
  };

  const playAgain = () => {
    if (gptResponse) {
      speakWithBrowserSynthesis(gptResponse);
    }
  };

  const clearChat = () => {
    setTranscript("");
    setGptResponse("");
    setTranslation("");
    setApiConversationHistory([]);
  };

  return {
    isListening,
    isLoading,
    isSpeaking,
    transcript,
    gptResponse,
    translation,
    toggleListening,
    handleSendTranscript,
    speakWithBrowserSynthesis,
    playAgain,
    clearChat
  };
};
