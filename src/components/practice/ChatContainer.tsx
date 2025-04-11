
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import EmptyChatState from "./EmptyChatState";
import LoadingIndicator from "./LoadingIndicator";
import { useLocalization } from "@/context/LocalizationContext";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

interface ChatContainerProps {
  messages: ChatMessage[];
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  getPlaceholderText: () => string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  getPlaceholderText,
}) => {
  const { currentLanguage } = useLocalization();
  const { speak, isSpeaking } = useSpeechSynthesis();
  
  const handleSpeak = (text: string) => {
    // Determine whether to use current language or target language for the AI responses
    const languageToUse = currentLanguage === "english" ? "spanish" : "english";
    speak(text, languageToUse).catch(error => {
      console.error("Error speaking text:", error);
      // Fallback to current language
      speak(text, currentLanguage);
    });
  };

  return (
    <Card className="mb-4 p-6">
      <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyChatState />
        ) : (
          messages.map((message, index) => (
            <div key={index} className="relative">
              <ChatMessage
                role={message.role}
                content={message.content}
                translation={message.translation}
              />
              {message.role === "assistant" && (
                <div className="absolute top-2 right-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSpeak(message.content)}
                    disabled={isSpeaking}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && <LoadingIndicator />}
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={getPlaceholderText()}
      />
    </Card>
  );
};

export default ChatContainer;
