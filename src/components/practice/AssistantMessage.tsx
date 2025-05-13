
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
  // Function to safely extract text from translation
  const getTranslationText = (translation: TranslationType): string => {
    if (typeof translation === 'string') {
      return translation;
    } else if (translation && typeof translation === 'object') {
      // Check for common properties that might hold the translation text
      if ('text' in translation) {
        return String(translation.text);
      } else if ('value' in translation) {
        return String(translation.value);
      } else if ('content' in translation) {
        return String(translation.content);
      }
    }
    return String(translation);
  };

  return (
    <div className="flex mb-4">
      <div className="bg-muted p-3 rounded-lg max-w-[80%]">
        <div className="text-foreground mb-1">{message}</div>
        {translation && (
          <div className="text-sm text-muted-foreground mt-2 border-t pt-1">
            {getTranslationText(translation)}
          </div>
        )}
      </div>
    </div>
  );
};
