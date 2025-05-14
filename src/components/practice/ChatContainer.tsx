
import React from "react";
import { Message } from "@/types/chat";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { ErrorMessage } from "./ErrorMessage";

export interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isLoading }) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => {
        if (message.role === "user") {
          return <UserMessage key={index} message={message.content} />;
        } else if (message.role === "assistant") {
          return (
            <AssistantMessage
              key={index}
              message={message.content}
              translation={message.translation}
            />
          );
        } else if (message.role === "error") {
          return <ErrorMessage key={index} message={message.content} />;
        } else if (message.role === "system") {
          // Handle system messages appropriately, perhaps show them differently or not at all
          return null;
        }
        // Handle any other role types
        return null;
      })}
    </div>
  );
};

export default ChatContainer;
