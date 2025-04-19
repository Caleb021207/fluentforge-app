
import { useState, useRef } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useVoiceChatMessages } from "@/hooks/useVoiceChatMessages";
import { ConversationStarters } from "@/components/voice-chat/ConversationStarters";
import { ConversationHistory } from "@/components/voice-chat/ConversationHistory";
import { VoiceChatControls } from "@/components/voice-chat/VoiceChatControls";
import {
  getPracticeDescription,
  getAIModelInfoText,
  getBrowserTTSNote,
  getPracticeLevelText,
  getAIModelLabelText,
} from "@/utils/voiceChatTextUtils";

const VoiceChat = () => {
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  const cefrLevel = 'B1';
  
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  const { isListening, transcript, toggleListening, setTranscript, clearSilenceDetection } = useSpeechRecognition();
  const { isSpeaking, speakText } = useSpeechSynthesis();
  const { messages, clearMessages, addMessage } = useVoiceChatMessages();

  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    clearSilenceDetection();
    setIsLoading(true);
    
    addMessage('user', text);
    
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
      
      addMessage('assistant', content);
      
      setGptResponse(content);
      setTranslation(translationText);
      
      setApiConversationHistory(data.updatedHistory || [
        ...apiConversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ]);
      
      speakText(content);
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
  };

  const clearConversation = () => {
    clearMessages();
    setApiConversationHistory([]);
    setTranscript("");
    setGptResponse("");
    setTranslation("");
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared"),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("unlimitedVoicePractice")}
        </h1>
        <p className="text-gray-600 mb-4">
          {getPracticeDescription()}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>{getAIModelLabelText()}</strong> {getAIModelInfoText()}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {getBrowserTTSNote()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{getPracticeLevelText()}: B1</span> - {t("cefrB1Description")}
              </p>
            </div>

            <VoiceChatControls
              isListening={isListening}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              transcript={transcript}
              onToggleListening={toggleListening}
              onSendTranscript={() => handleSendTranscript(transcript)}
            />
          </div>
          
          {isListening && (
            <div className="text-sm text-gray-500 animate-pulse mb-4">
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
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{t("aiResponse")}:</h3>
                <Button 
                  onClick={() => speakText(gptResponse)} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isSpeaking}
                >
                  <Volume2 className="h-4 w-4" />
                  {isSpeaking ? t("speaking") : t("playAgain")}
                </Button>
              </div>
              <div className="bg-lingua-primary/10 rounded-lg p-4 text-gray-800">
                {gptResponse}
                
                {((translation && translation.trim() !== "") || currentLanguage === "hindi") && (
                  <>
                    <div className="border-t border-gray-300 my-3"></div>
                    <div className="text-sm text-gray-600">
                      <strong>{t("translation")}:</strong> {translation || "अनुवाद उपलब्ध नहीं है"}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>
        
        <ConversationHistory
          messages={messages}
          onClear={clearConversation}
          onPlayAudio={speakText}
        />
        
        <ConversationStarters onPhraseClick={handleSendTranscript} />
      </div>
    </div>
  );
};

export default VoiceChat;
