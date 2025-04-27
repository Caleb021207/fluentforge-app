
import React from "react";
import { Card } from "@/components/ui/card";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import EmptyChatState from "./EmptyChatState";
import LoadingIndicator from "./LoadingIndicator";
import { useLocalization } from "@/context/LocalizationContext";

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
  const { t, currentLanguage } = useLocalization();
  
  // Debug information
  console.log("Current Language:", currentLanguage);
  console.log("Translation example:", t("send"));
  console.log("Translation missing example:", t("some_random_key_to_test_fallback"));

  return (
    <Card className="mb-4 p-6">
      <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
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
        placeholder={getPlaceholderText() || "Type a message..."}
      />
    </Card>
  );
};

export default ChatContainer;
