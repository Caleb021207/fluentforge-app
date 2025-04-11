
import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useToast } from "@/hooks/use-toast";
import { useLearnLanguageChat } from "@/hooks/useLearnLanguageChat";
import { useLocalization } from "@/context/LocalizationContext";
import LearnLanguageHeader from "@/components/learn-language/LearnLanguageHeader";
import LearnLanguageControls from "@/components/learn-language/LearnLanguageControls";
import TranscriptDisplay from "@/components/french-voice-chat/TranscriptDisplay";
import AIResponseDisplay from "@/components/french-voice-chat/AIResponseDisplay";
import ConversationHistory from "@/components/french-voice-chat/ConversationHistory";
import ConversationStarters from "@/components/french-voice-chat/ConversationStarters";
import PracticeTips from "@/components/french-voice-chat/PracticeTips";

const LearnFrenchVoiceChat = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const { currentLanguage, t } = useLocalization();
  
  useEffect(() => {
    // Store the target language in localStorage when this component mounts
    localStorage.setItem("targetLanguage", "french");
    // This helps with proper redirection from the main voice chat page
  }, []);
  
  const {
    transcript,
    setTranscript,
    gptResponse,
    translation,
    isLoading,
    conversationHistory,
    handleSendTranscript,
    clearConversation,
    getConversationStarters
  } = useLearnLanguageChat('french');

  // Using French voice for the AI responses since this is for English speakers learning French
  const { speak, isSpeaking, cancel } = useSpeechSynthesis({
    defaultLanguage: 'fr-FR'
  });

  // Setting language to French (fr-FR) because English speakers are practicing French
  const { isListening, startListening, stopListening, usingFallback } = useSpeechRecognition({
    onTranscriptChange: setTranscript,
    onSilence: () => {
      if (transcript && transcript.trim().length > 0) {
        console.log("Silence detected, sending transcript:", transcript);
        handleSendTranscript(transcript);
        stopListening();
      }
    },
    onError: (errorMessage) => {
      console.error("Speech recognition error:", errorMessage);
      setPermissionError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
    language: 'fr-FR' // Using French for recognition since we're practicing French
  });

  // Effect to handle audio playback of response
  useEffect(() => {
    if (gptResponse && !isSpeaking) {
      // Automatically play the response when it's received
      speak(gptResponse, 'fr-FR');
    }
    
    // Cancel any ongoing speech when component unmounts
    return () => {
      cancel();
    };
  }, [gptResponse, speak, isSpeaking, cancel]);

  // Clear permission error when listening starts successfully
  useEffect(() => {
    if (isListening && permissionError) {
      setPermissionError(null);
    }
  }, [isListening, permissionError]);

  const toggleListening = () => {
    console.log("Toggle listening called, current state:", isListening);
    if (isListening) {
      stopListening();
    } else {
      // Clear the transcript when starting a new recording
      setTranscript("");
      startListening();
    }
  };

  const playAgain = () => {
    if (gptResponse) {
      speak(gptResponse, 'fr-FR');
    }
  };

  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <LearnLanguageHeader language="French" />

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <LearnLanguageControls 
            isListening={isListening}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            transcript={transcript}
            onToggleListening={toggleListening}
            onSendTranscript={() => handleSendTranscript(transcript)}
            language="French"
          />
          
          {permissionError && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md">
              <p className="text-sm font-medium">
                {permissionError}
              </p>
              <p className="text-xs mt-1">
                Please ensure your browser has permission to access your microphone.
              </p>
            </div>
          )}
          
          {usingFallback && (
            <div className="mb-4 p-2 bg-amber-50 text-amber-700 rounded-md">
              <p className="text-sm font-medium">
                Using server-side transcription (fallback mode)
              </p>
              <p className="text-xs mt-1">
                Your browser's speech recognition is not available or not working well with French. We're using our server for transcription instead.
              </p>
            </div>
          )}
          
          <TranscriptDisplay 
            transcript={transcript}
            isListening={isListening}
          />

          {isLoading && (
            <div className="flex justify-center my-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <AIResponseDisplay 
            gptResponse={gptResponse}
            translation={translation}
            isSpeaking={isSpeaking}
            onPlayAgain={playAgain}
          />
        </Card>
        
        <ConversationHistory 
          messages={conversationHistory}
          onClearConversation={clearConversation}
        />

        <ConversationStarters 
          nativeLanguagePhrases={nativeLanguagePhrases}
          targetLanguagePhrases={targetLanguagePhrases}
          onPhraseClick={phrase => handleSendTranscript(phrase)}
        />
        
        <PracticeTips />
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default LearnFrenchVoiceChat;
