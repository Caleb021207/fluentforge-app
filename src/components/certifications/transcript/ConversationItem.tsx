
import React from "react";
import { Bot, User } from "lucide-react";

interface ConversationItemProps {
  message: string;
  isAi: boolean;
}

const ConversationItem = ({ message, isAi }: ConversationItemProps) => {
  // Function to format message text - detects and formats URLs, line breaks, etc.
  const formatMessage = (text: string) => {
    // Convert line breaks to <br /> tags
    const withLineBreaks = text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
    
    return withLineBreaks;
  };

  // Handle undefined or null messages
  if (!message) {
    console.warn('Received undefined or null message in ConversationItem');
    return null;
  }

  return (
    <div className="flex gap-3 mb-4">
      <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border ${
        isAi ? "bg-primary text-primary-foreground" : "bg-muted"
      } shadow${isAi ? "" : "-sm"}`}>
        {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="prose-sm prose-gray max-w-none">
          <p>{formatMessage(message)}</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
