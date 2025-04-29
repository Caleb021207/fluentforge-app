
import React, { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanguagePair } from "@/utils/languageUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import PollyTTSSettings from "@/components/voice-chat/PollyTTSSettings";
import { getDefaultVoice, speakText } from "@/utils/pollyTtsUtils";

const VoiceChat = () => {
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  const { isLoading, isAuthenticated } = useAuthGuard();
  const [isRecording, setIsRecording] = useState(false);
  const [voiceId, setVoiceId] = useState<string>(getDefaultVoice(currentLanguage));
  
  // Get the language pair for practice
  const { practice: practiceLanguage } = getLanguagePair(currentLanguage);
  
  // Sample phrases for demonstration
  const samplePhrases = [
    "Hello, how are you today?",
    "My name is Alex. What's your name?",
    "I'm learning a new language.",
    "The weather is nice today.",
    "Would you like to get a coffee?",
    "Can you help me practice my pronunciation?"
  ];

  const handleMicToggle = async () => {
    try {
      if (!isRecording) {
        // Request microphone access when starting recording
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        toast({
          title: t("microphoneActive"),
          description: t("speakNow"),
        });
      } else {
        // Stop recording
        setIsRecording(false);
        toast({
          title: t("recordingStopped"),
          description: t("processingAudio"),
        });
        // In a real implementation, you would process the audio here
      }
    } catch (error) {
      console.error("Microphone access error:", error);
      toast({
        title: t("error"),
        description: t("microphoneAccessRequired"),
        variant: "destructive",
      });
    }
  };

  const handlePlaySample = async (text: string) => {
    try {
      await speakText(text, currentLanguage, voiceId);
    } catch (error) {
      console.error("Error playing audio:", error);
      toast({
        title: t("error"),
        description: t("errorPlayingAudio"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      if (isRecording) {
        setIsRecording(false);
      }
    };
  }, [isRecording]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lingua-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <AuthRequiredPrompt />;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("voiceChat")}
        </h1>
        <p className="text-gray-600 mb-4">
          {t("voiceChatDescription", { language: practiceLanguage })}
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("speakWithAI")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 my-6">
            <Button 
              onClick={handleMicToggle}
              size="lg"
              className={`flex items-center justify-center px-8 py-6 rounded-full text-lg ${
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-lingua-primary hover:bg-lingua-primary-dark"
              }`}
            >
              {isRecording ? (
                <MicOff className="h-6 w-6 mr-2" />
              ) : (
                <Mic className="h-6 w-6 mr-2" />
              )}
              <span>
                {isRecording ? t("stopRecording") : t("startRecording")}
              </span>
            </Button>
            {isRecording && <p className="text-sm text-red-500">{t("recording")}</p>}
          </div>
          
          <div className="mt-8">
            <h3 className="font-semibold mb-3">{t("voiceSettings")}</h3>
            <PollyTTSSettings voiceId={voiceId} onVoiceChange={setVoiceId} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("samplePhrases")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {samplePhrases.map((phrase, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span>{phrase}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handlePlaySample(phrase)}
                  title={t("playAudio")}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceChat;
