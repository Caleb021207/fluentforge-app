
import React from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  getPlaceholderText: () => string;
  targetLanguage: string;
}

const ChatContainer = ({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  getPlaceholderText,
  targetLanguage
}: ChatContainerProps) => {
  const { t } = useLocalization();

  return (
    <div className="space-y-4">
      {messages.length > 0 && (
        <Card className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                translation={message.translation}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={t("typeYourMessageHere")}
        messages={messages}
        targetLanguage={targetLanguage}
      />

      {messages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t("startTextChat")}</p>
          <p className="text-sm mt-2">{t("typeMessageBelow")}</p>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
