
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalization } from "@/context/LocalizationContext";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  messages: ConversationMessage[];
  onClearConversation: () => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  onClearConversation
}) => {
  const { currentLanguage, t } = useLocalization();
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">
          {currentLanguage === "french" ? "Historique de la conversation" : t("conversationHistory")}
        </h3>
        <Button 
          onClick={onClearConversation}
          variant="outline" 
          size="sm"
        >
          {currentLanguage === "french" ? "Effacer la conversation" : t("clearConversation")}
        </Button>
      </div>
      
      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-100 text-gray-800' 
                    : 'bg-green-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.translation && message.translation.trim() !== "" && (
                  <p className="text-xs mt-2 text-gray-600 border-t border-gray-200 pt-2">
                    <span className="font-medium">{currentLanguage === "french" ? "Traduction" : t("translation")}:</span> {message.translation}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={conversationEndRef} />
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ConversationHistory;
