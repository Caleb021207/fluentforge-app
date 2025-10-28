import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import HintButton from "@/components/practice/HintButton";
import { useLocalization } from "@/context/LocalizationContext";
import ChatMessage from "@/components/practice/ChatMessage";
import { VoiceChatContainerProps } from "@/types/voiceChat";
import { TranslationType } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
const VoiceChatContainer: React.FC<VoiceChatContainerProps> = ({
  messages,
  isLoading,
  targetLanguage,
  onPlayAudio,
  sessionId
}) => {
  const {
    t
  } = useLocalization();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll disabled for better UX during rapid conversations

  return <Card className="overflow-hidden mb-10">
      <ScrollArea className="h-[600px] p-8">
        {messages.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              {t("startSpeakingToSeeTranscript")}
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-md">
              {t("clickMicrophoneToStartRecording")}
            </p>
          </div> : <div className="space-y-8">
            {messages.map((message, index) => {
          // Filter out system messages or convert them to assistant messages
          if (message.role === "system") {
            // Skip system messages or convert them to assistant messages
            return (
              <div key={index} className="relative group">
                <ChatMessage 
                  role="assistant" 
                  content={message.content} 
                  translation={message.translation as TranslationType} 
                  onPlayAudio={onPlayAudio} 
                />
                {onPlayAudio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onPlayAudio(message.content)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          }
          return (
            <div key={index} className="relative group">
              <ChatMessage 
                role={message.role as "user" | "assistant"} 
                content={message.content} 
                translation={message.translation as TranslationType} 
                onPlayAudio={onPlayAudio} 
              />
              {message.role === "assistant" && onPlayAudio && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onPlayAudio(message.content)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
            
            {isLoading && <div className="flex justify-center my-6">
                <div className="flex space-x-3">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-3 h-3 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>}
            
            <div ref={scrollRef} />
          </div>}
      </ScrollArea>
      
      
    </Card>;
};
export default VoiceChatContainer;