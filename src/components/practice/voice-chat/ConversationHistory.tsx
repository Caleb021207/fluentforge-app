
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import ChatMessage from '@/components/practice/ChatMessage';

interface ConversationHistoryProps {
  conversationHistory: {
    role: 'user' | 'assistant';
    content: string;
    translation?: string;
    timestamp: Date;
  }[];
  onClearConversation: () => void;
  onPlayAudio: (text: string) => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversationHistory,
  onClearConversation,
  onPlayAudio
}) => {
  const { t } = useLocalization();
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);
  
  if (conversationHistory.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">
          {t("conversationHistory")}
        </h3>
        <Button 
          onClick={onClearConversation}
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
              onPlayAudio={onPlayAudio}
            />
          ))}
          <div ref={conversationEndRef} />
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ConversationHistory;
