
import React from "react";
import { Bot, User } from "lucide-react";

interface ConversationItemProps {
  message: string;
  isAi: boolean;
}

const ConversationItem = ({ message, isAi }: ConversationItemProps) => {
  return (
    <div className="flex gap-3">
      <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border ${
        isAi ? "bg-primary text-primary-foreground" : "bg-muted"
      } shadow${isAi ? "" : "-sm"}`}>
        {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="prose-sm prose-gray">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
