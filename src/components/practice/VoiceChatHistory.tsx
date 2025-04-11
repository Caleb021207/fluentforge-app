
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalization } from "@/context/LocalizationContext";
import ChatMessage from "@/components/practice/ChatMessage";
import { VoiceMessage } from "@/hooks/useVoiceChatMessages";

interface VoiceChatHistoryProps {
  messages: VoiceMessage[];
  onClearHistory: () => void;
  onPlayAudio: (text: string) => void;
}

const VoiceChatHistory: React.FC<VoiceChatHistoryProps> = ({ 
  messages, 
  onClearHistory,
  onPlayAudio
}) => {
  const { t } = useLocalization();
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">
          {t("conversationHistory")}
        </h3>
        <Button 
          onClick={onClearHistory}
          variant="outline" 
          size="sm"
        >
          {t("clearConversation")}
        </Button>
      </div>
      
      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              translation={message.translation}
              onPlayAudio={(text) => onPlayAudio(text)}
            />
          ))}
          <div ref={conversationEndRef} />
        </div>
      </ScrollArea>
    </Card>
  );
};

export default VoiceChatHistory;
