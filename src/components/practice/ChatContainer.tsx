
import React from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import LoadingIndicator from "./LoadingIndicator";
import EmptyChatState from "./EmptyChatState";
import { Message } from "@/types/chat";
import { TranslationType } from "@/components/practice/hooks/translation";

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  getPlaceholderText: () => string;
  targetLanguage: string;
  speechRate?: number;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  getPlaceholderText,
  targetLanguage,
  speechRate = 1.0
}) => {
  return (
    <div className="bg-card dark:bg-card/80 border rounded-lg shadow-sm flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && <EmptyChatState />}

        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role === 'system' ? 'assistant' : message.role}
            content={message.content}
            translation={message.translation as TranslationType}
            speechRate={speechRate}
          />
        ))}

        {isLoading && <LoadingIndicator />}
      </div>

      <div className="border-t p-4">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder={getPlaceholderText()}
          messages={messages}
          targetLanguage={targetLanguage}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
