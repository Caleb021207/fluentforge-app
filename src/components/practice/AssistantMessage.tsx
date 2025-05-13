
import React from "react";
import { TranslationType } from "./hooks/translation/types";

interface AssistantMessageProps {
  message: string;
  translation?: TranslationType;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ 
  message, 
  translation 
}) => {
  return (
    <div className="flex mb-4">
      <div className="bg-muted p-3 rounded-lg max-w-[80%]">
        <div className="text-foreground mb-1">{message}</div>
        {translation && (
          <div className="text-sm text-muted-foreground mt-2 border-t pt-1">
            {typeof translation === 'string' ? translation : translation.text}
          </div>
        )}
      </div>
    </div>
  );
};
