
import React from "react";
import { Card } from "@/components/ui/card";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import EmptyChatState from "./EmptyChatState";
import LoadingIndicator from "./LoadingIndicator";
import { useLocalization } from "@/context/LocalizationContext";

interface ChatContainerMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

interface ChatContainerProps {
  messages: ChatContainerMessage[];
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
  const { t } = useLocalization();
  
  return (
    <Card className="mb-4 p-6 bg-white/95 dark:bg-gray-800/95 border-lingua-accent/30 shadow-md transition-all duration-300">
      <div className="space-y-4 mb-5 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-lingua-accent/20 hover:scrollbar-thumb-lingua-accent/40 dark:scrollbar-thumb-gray-600">
        {messages.length === 0 ? (
          <EmptyChatState />
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              translation={message.translation}
            />
          ))
        )}
        {isLoading && <LoadingIndicator />}
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={getPlaceholderText() || t("typeMessage") || "Type a message..."}
      />
    </Card>
  );
};

export default ChatContainer;
