
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  text: string;
  isUser: boolean;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ text, isUser }) => {
  return (
    <div className={cn(
      "flex items-start gap-3",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="w-8 h-8">
        <AvatarFallback className={isUser ? "bg-blue-100" : "bg-gray-100"}>
          {isUser ? "Y" : "A"}
        </AvatarFallback>
      </Avatar>
      
      <div 
        className={cn(
          "rounded-lg py-2 px-3 max-w-[80%]",
          isUser 
            ? "bg-blue-100 text-blue-900 rounded-tr-none" 
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
};

export default ConversationItem;
