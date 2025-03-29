import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import englishTranslations from "@/translations/english";
import spanishTranslations from "@/translations/spanish";

const VoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      recognitionRef.current.lang = currentLanguage === "english" ? "es-ES" : "en-US";
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        handleSendTranscript(transcript);
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
        setIsListening(false);
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
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [currentLanguage, toast, t]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setTranscript("");
          setGptResponse("");
          setAudioUrl("");
          setHasPlayedAudio(false);
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
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          userLanguage: currentLanguage
        }
      });

      if (error) throw error;
      
      setGptResponse(data.reply);
      generateSpeech(data.reply);
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
  };

  const generateSpeech = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: currentLanguage === "english" ? "nova" : "alloy"
        }
      });

      if (error) throw error;
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const byteCharacters = atob(data.audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play()
          .then(() => setHasPlayedAudio(true))
          .catch(error => {
            console.error("Audio playback error:", error);
            toast({
              title: t("error"),
              description: t("audioPlaybackError"),
              variant: "destructive",
            });
          });
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        title: t("error"),
        description: t("failedToGenerateSpeech"),
        variant: "destructive",
      });
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
        .then(() => setHasPlayedAudio(true))
        .catch(error => {
          console.error("Audio playback error:", error);
          toast({
            title: t("error"),
            description: t("audioPlaybackError"),
            variant: "destructive",
          });
        });
    }
  };

  const getLanguagePair = () => {
    if (currentLanguage === "english") {
      return { practice: "Spanish", native: "English" };
    } else if (currentLanguage === "spanish") {
      return { practice: "English", native: "Spanish" };
    } else if (currentLanguage === "portuguese") {
      return { practice: "English", native: "Portuguese" };
    }
    return { practice: "Spanish", native: "English" };
  };

  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    
    const nativeLanguagePhrases = phraseKeys.map(key => t(key));
    
    let targetLanguagePhrases;
    
    if (currentLanguage === "english") {
      targetLanguagePhrases = phraseKeys.map(key => {
        const spanishPhrase = spanishTranslations[key];
        return spanishPhrase || key;
      });
    } else {
      targetLanguagePhrases = phraseKeys.map(key => {
        const englishPhrase = englishTranslations[key];
        return englishPhrase || key;
      });
    }
    
    return { nativeLanguagePhrases, targetLanguagePhrases };
  };

  const { practice, native } = getLanguagePair();
  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("unlimitedVoicePractice")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "english" 
            ? `Practice your ${practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${practice}. The AI will respond to you in ${practice} and help you practice.`
            : `Practice your ${practice} speaking skills. Click the microphone button and start speaking in ${practice}. The AI will respond to you and help you practice.`}
        </p>
      </div>

      <Card className="mb-6 p-6">
        <div className="flex flex-col items-center mb-6">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="mb-4"
            disabled={isLoading}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                {t("stopListening")}
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                {t("startSpeaking")}
              </>
            )}
          </Button>
          
          {isListening && (
            <div className="text-sm text-gray-500 animate-pulse">
              {t("listeningNow")}...
            </div>
          )}
        </div>

        {transcript && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">{t("youSaid")}:</h3>
            <div className="bg-gray-100 rounded-lg p-4 text-gray-800">
              {transcript}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center my-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {gptResponse && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{t("aiResponse")}:</h3>
              {audioUrl && (
                <Button 
                  onClick={playAudio} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  {t("playAgain")}
                </Button>
              )}
            </div>
            <div className="bg-lingua-primary/10 rounded-lg p-4 text-gray-800">
              {gptResponse}
            </div>
          </div>
        )}
      </Card>

      <Card className="mb-6 p-6">
        <h3 className="font-medium mb-4">{t("conversationStarters")}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {t("tryThesePhrases")}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2 text-lingua-primary">
              {t("inYourTargetLanguage")} ({practice})
            </h4>
            <ul className="space-y-2">
              {targetLanguagePhrases.map((phrase, index) => (
                <li key={`target-${index}`} className="text-sm p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                  {phrase}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 text-lingua-primary">
              {t("inYourNativeLanguage")} ({native})
            </h4>
            <ul className="space-y-2">
              {nativeLanguagePhrases.map((phrase, index) => (
                <li key={`native-${index}`} className="text-sm p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                  {phrase}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="font-medium mb-2">{t("practiceWithVoiceChat")}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {t("practiceLanguageTips")}
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>{t("askQuestionsAboutTopics")}</li>
          <li>{t("practiceEverydayPhrases")}</li>
          <li>{t("describeImagesOrScenes")}</li>
          <li>{t("practiceVocabularyForSpecificTopics")}</li>
        </ul>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceChat;
