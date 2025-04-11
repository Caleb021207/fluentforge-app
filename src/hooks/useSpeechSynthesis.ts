
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

  // Helper function to get the best language code for TTS
  const getBestLanguageCode = (langCode: string): string => {
    // Map of language codes to standardized formats for TTS
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'pt': 'pt-PT',
      'es': 'es-ES',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ru': 'ru-RU',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'vi': 'vi-VN'
    };
    
    // If language code is already in complete format (e.g., 'en-US')
    if (langCode.includes('-')) {
      return langCode;
    }
    
    // If language code is in short format (e.g., 'en')
    const shortCode = langCode.toLowerCase().split('-')[0];
    return languageMap[shortCode] || langCode;
  };

  // Function to speak using browser's Speech Synthesis API
  const speakWithBrowser = (text: string, langCode: string) => {
    if (!synthRef.current) {
      console.error('Speech synthesis not available');
      return false;
    }
    
    synthRef.current.cancel();
    
    const bestLangCode = getBestLanguageCode(langCode);
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.lang = bestLangCode;
    
    console.log(`Setting speech synthesis language to: ${bestLangCode}`);
    
    // Need to delay getting voices to ensure they're loaded
    setTimeout(() => {
      const voices = synthRef.current.getVoices();
      console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
      
      const voiceLangPrefix = bestLangCode.split('-')[0];
      // Try to find voice with exact match first
      let voice = voices.find(v => v.lang.toLowerCase() === bestLangCode.toLowerCase());
      
      // If no exact match, try to find voice with matching language prefix
      if (!voice) {
        voice = voices.find(v => v.lang.toLowerCase().startsWith(voiceLangPrefix.toLowerCase()));
      }
      
      if (voice) {
        console.log(`Using voice: ${voice.name} (${voice.lang})`);
        utteranceRef.current.voice = voice;
      } else {
        console.warn(`No matching voice found for language: ${bestLangCode}`);
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
      };
      
      try {
        synthRef.current.speak(utteranceRef.current);
      } catch (e) {
        console.error("Error speaking with browser TTS:", e);
        speakWithServer(text, bestLangCode.split('-')[0]);
      }
    }, 100);
    
    return true;
  };

  // Function to speak using server-side TTS
  const speakWithServer = async (text: string, language: string) => {
    if (!audioRef.current) return false;
    
    try {
      setIsSpeaking(true);
      
      console.log(`Using server-side TTS for language: ${language}`);
      
      // Simplify language code for server (e.g., 'en-US' -> 'en')
      const simpleLang = language.split('-')[0].toLowerCase();
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          language: simpleLang
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
    
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speech synthesis, ignoring');
      return false;
    }
    
    console.log(`Attempting to speak text in language: ${langCode}`);
    
    // Always try browser TTS first
    const browserSuccess = speakWithBrowser(text, langCode);
    
    // If browser TTS is not available or fails, we'll fallback to server
    // This will be handled by the onError event of the utterance
    
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
