
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

interface UseSpeechSynthesisProps {
  defaultLanguage?: string;
}

export const useSpeechSynthesis = ({
  defaultLanguage = 'en-US'
}: UseSpeechSynthesisProps = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  // Initialize audio element for server-side TTS
  useEffect(() => {
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.onplay = () => {
        setIsSpeaking(true);
      };
      
      audioRef.current.onended = () => {
        setIsSpeaking(false);
      };
      
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        toast({
          title: t("error"),
          description: t("audioPlaybackError"),
          variant: "destructive",
        });
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [t, toast]);

  // Function to speak using browser's Speech Synthesis API
  const speakWithBrowser = (text: string, langCode: string) => {
    if (!synthRef.current) {
      console.error('Speech synthesis not available');
      return false;
    }
    
    synthRef.current.cancel();
    
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.lang = langCode;
    
    console.log(`Setting speech synthesis language to: ${langCode}`);
    
    const voices = synthRef.current.getVoices();
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
    
    const voiceLangPrefix = langCode.split('-')[0];
    const voice = voices.find(v => v.lang.startsWith(voiceLangPrefix));
    
    if (voice) {
      console.log(`Using voice: ${voice.name} (${voice.lang})`);
      utteranceRef.current.voice = voice;
    } else {
      console.warn(`No matching voice found for language: ${langCode}`);
    }
    
    utteranceRef.current.onstart = () => {
      console.log("Speech synthesis started");
      setIsSpeaking(true);
    };
    
    utteranceRef.current.onend = () => {
      console.log("Speech synthesis ended");
      setIsSpeaking(false);
    };
    
    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      return false;
    };
    
    try {
      synthRef.current.speak(utteranceRef.current);
      return true;
    } catch (e) {
      console.error("Error speaking with browser TTS:", e);
      return false;
    }
  };

  // Function to speak using server-side TTS
  const speakWithServer = async (text: string, language: string) => {
    if (!audioRef.current) return false;
    
    try {
      setIsSpeaking(true);
      
      console.log(`Using server-side TTS for language: ${language}`);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          language: language.split('-')[0].toLowerCase()
        }
      });
      
      if (error) throw error;
      
      if (!data.audioContent) {
        throw new Error('No audio content returned from server');
      }
      
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      audioRef.current.src = audioSrc;
      
      try {
        await audioRef.current.play();
        return true;
      } catch (playError) {
        console.error('Error playing audio:', playError);
        setIsSpeaking(false);
        return false;
      }
    } catch (error) {
      console.error('Error with server-side TTS:', error);
      setIsSpeaking(false);
      toast({
        title: t("error"),
        description: t("failedToGenerateSpeech"),
        variant: "destructive",
      });
      return false;
    }
  };

  const speak = async (text: string, langCode: string = defaultLanguage) => {
    // Always cancel any ongoing speech first
    cancel();
    
    // Always try browser TTS first
    const browserSuccess = speakWithBrowser(text, langCode);
    
    // If browser TTS fails or isn't available for the language, use server-side TTS
    if (!browserSuccess) {
      console.log("Browser TTS failed or unavailable, trying server-side TTS");
      return await speakWithServer(text, langCode);
    }
    
    return browserSuccess;
  };

  const cancel = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setIsSpeaking(false);
  };

  return { 
    speak, 
    cancel, 
    isSpeaking 
  };
};
