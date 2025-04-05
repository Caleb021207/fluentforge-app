
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";

// Import refactored hooks
import { useSpeechRecognition } from "@/components/voice-chat/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/components/voice-chat/hooks/useSpeechSynthesis";
import { useConversationHistory } from "@/components/voice-chat/hooks/useConversationHistory";
import { useCefrLevel } from "@/components/voice-chat/hooks/useCefrLevel";

// Import refactored components
import VoiceChatHeader from "@/components/voice-chat/components/VoiceChatHeader";
import ConversationList from "@/components/voice-chat/components/ConversationList";
import ConversationStarters from "@/components/voice-chat/components/ConversationStarters";
import PracticeGuide from "@/components/voice-chat/components/PracticeGuide";
import ResponseCard from "@/components/voice-chat/components/ResponseCard";

const VoiceChat = () => {
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { cefrLevel, cefrDescription, practiceLevelText } = useCefrLevel();
  const { 
    conversationHistory, 
    apiConversationHistory,
    conversationEndRef, 
    addUserMessage, 
    addAssistantMessage, 
    clearConversation,
    setApiConversationHistory
  } = useConversationHistory();
  const { isSpeaking, speakText } = useSpeechSynthesis();
  const { isListening, transcript, toggleListening, setTranscript } = useSpeechRecognition(handleSendTranscript);

  function handleSendTranscript(text: string) {
    processUserInput(text);
  }

  async function processUserInput(text: string) {
    addUserMessage(text);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          userLanguage: currentLanguage,
          conversationHistory: apiConversationHistory,
          cefrLevel: cefrLevel,
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
      if (!translationText) {
        console.log("No translation provided for response in language:", currentLanguage);
        
        const targetLanguage = currentLanguage === "english" ? "spanish" : currentLanguage;
        
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: content,
              userLanguage: targetLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translationText = translationData.translation;
            console.log("Got translation manually:", translationText);
          }
        } catch (translationError) {
          console.error("Failed to get translation:", translationError);
        }
      }
      
      addAssistantMessage(content, translationText);
      
      setGptResponse(content);
      setTranslation(translationText);
      
      setApiConversationHistory(data.updatedHistory || [
        ...apiConversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ]);
      
      speakText(content);
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
  }

  const handlePhraseClick = (phrase: string) => {
    processUserInput(phrase);
  };

  const playAgain = () => {
    if (gptResponse) {
      speakText(gptResponse);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <VoiceChatHeader />

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{practiceLevelText}: B1</span> - {cefrDescription}
              </p>
            </div>

            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              disabled={isLoading || isSpeaking}
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
          </div>
          
          {isListening && (
            <div className="text-sm text-gray-500 animate-pulse">
              {t("listeningNow")}...
            </div>
          )}

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
            <ResponseCard 
              gptResponse={gptResponse}
              translation={translation}
              isSpeaking={isSpeaking}
              onPlay={playAgain}
            />
          )}
        </Card>
        
        {conversationHistory.length > 0 && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {t("conversationHistory")}
              </h3>
              <Button 
                onClick={clearConversation}
                variant="outline" 
                size="sm"
              >
                {t("clearConversation")}
              </Button>
            </div>
            
            <ConversationList 
              messages={conversationHistory}
              conversationEndRef={conversationEndRef}
            />
          </Card>
        )}

        <ConversationStarters onPhraseClick={handlePhraseClick} />
        
        <PracticeGuide />
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceChat;
