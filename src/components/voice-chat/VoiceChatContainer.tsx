import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import HintButton from "@/components/practice/HintButton";
import { useLocalization } from "@/context/LocalizationContext";
import ChatMessage from "@/components/practice/ChatMessage";
import { VoiceChatContainerProps } from "@/types/voiceChat";
import { TranslationType } from "@/types/chat";
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

  return <Card className="overflow-hidden mb-6">
      <ScrollArea className="h-[500px] p-4">
        {messages.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground mb-4">
              {t("startSpeakingToSeeTranscript")}
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              {t("clickMicrophoneToStartRecording")}
            </p>
          </div> : <div className="space-y-4">
            {messages.map((message, index) => {
          // Filter out system messages or convert them to assistant messages
          if (message.role === "system") {
            // Skip system messages or convert them to assistant messages
            return <ChatMessage key={index} role="assistant" content={message.content} translation={message.translation as TranslationType} onPlayAudio={onPlayAudio} />;
          }
          return <ChatMessage key={index} role={message.role as "user" | "assistant"} content={message.content} translation={message.translation as TranslationType} onPlayAudio={onPlayAudio} />;
        })}
            
            {isLoading && <div className="flex justify-center my-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>}
            
            <div ref={scrollRef} />
          </div>}
      </ScrollArea>
      
      
    </Card>;
};
export default VoiceChatContainer;