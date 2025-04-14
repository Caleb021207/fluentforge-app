import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import ChatMessage from "@/components/practice/ChatMessage";
import { useVoiceRecognition } from "@/hooks/voice-chat/useVoiceRecognition";
import VoiceChatHeader from "@/components/practice/voice-chat/VoiceChatHeader";
import VoiceChatControls from "@/components/practice/voice-chat/VoiceChatControls";
import VoiceChatResponse from "@/components/practice/voice-chat/VoiceChatResponse";
import { playTTS } from "@/utils/ttsUtils";
import { ConversationStarters } from "@/components/practice/voice-chat/ConversationStarters";

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};

const VoiceChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { isListening, transcript, toggleListening, setTranscript, clearSilenceDetection } = useVoiceRecognition();

  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    clearSilenceDetection();
    setIsLoading(true);
    
    const userMessage: ConversationMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          userLanguage: currentLanguage,
          conversationHistory: apiConversationHistory,
          cefrLevel: 'B1',
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
          }
        } catch (translationError) {
          console.error("Failed to get Hindi translation:", translationError);
        }
      }
      
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: content,
        translation: translationText,
        timestamp: new Date()
      };
      
      setGptResponse(content);
      setTranslation(translationText);
      setConversationHistory(prev => [...prev, aiMessage]);
      setApiConversationHistory(prev => [
        ...prev,
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
  };

  const speakWithBrowserSynthesis = (text: string) => {
    if (!text || text.trim() === '') return;
    
    setIsSpeaking(true);
    
    playTTS({
      text,
      language: currentLanguage,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
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

  const clearConversation = () => {
    setConversationHistory([]);
    setApiConversationHistory([]);
    setTranscript("");
    setGptResponse("");
    setTranslation("");
    toast({
      title: t("success"),
      description: t("conversationHistoryCleared"),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <VoiceChatHeader />

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{t("practiceLevel")}: B1</span> - {t("cefrB1Description")}
              </p>
            </div>

            <VoiceChatControls
              isListening={isListening}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              transcript={transcript}
              onToggleListening={toggleListening}
              onSendTranscript={handleSendTranscript}
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

          <VoiceChatResponse
            gptResponse={gptResponse}
            translation={translation}
            isSpeaking={isSpeaking}
            onPlayAgain={() => gptResponse && speakWithBrowserSynthesis(gptResponse)}
          />
        </Card>
        
        {conversationHistory.length > 0 && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">{t("conversationHistory")}</h3>
              <Button 
                onClick={clearConversation}
                variant="outline" 
                size="sm"
              >
                {t("clearConversation")}
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {conversationHistory.map((message, index) => (
                  <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    translation={message.translation}
                    onPlayAudio={(text) => speakWithBrowserSynthesis(text)}
                  />
                ))}
                <div ref={conversationEndRef} />
              </div>
            </ScrollArea>
          </Card>
        )}
        
        <ConversationStarters onPhraseClick={handleSendTranscript} />
      </div>
    </div>
  );
};

export default VoiceChat;
