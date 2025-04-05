
import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalization } from "@/context/LocalizationContext";
import { ConversationMessage } from "../hooks/useConversationHistory";

interface ConversationListProps {
  messages: ConversationMessage[];
  conversationEndRef: React.RefObject<HTMLDivElement>;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  messages,
  conversationEndRef
}) => {
  const { t } = useLocalization();

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, conversationEndRef]);

  if (messages.length === 0) {
    return null;
  }

  return (
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
              {message.translation && (
                <p className="text-xs mt-2 text-gray-600 border-t border-gray-200 pt-2">
                  <span className="font-medium">{t("translation")}:</span> {message.translation}
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
  );
};

export default ConversationList;
