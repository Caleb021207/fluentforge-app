
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { Message } from "@/types/chat";

export interface HintButtonProps {
  messages: Message[];
  targetLanguage: string;
  className?: string; // Add className prop
}

const HintButton = ({ messages, targetLanguage, className = "" }: HintButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocalization();
  
  // This is a placeholder for hint generation functionality
  // In a real implementation, this would call an API to get hints
  const handleGetHints = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Here we would set hints based on API response
    }, 1000);
  };
  
  return (
    <div className={`mb-2 ${className}`}>
      {messages.length > 0 ? (
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          onClick={handleGetHints}
          disabled={isLoading || messages.length === 0}
        >
          <Lightbulb className="h-3 w-3 mr-1" />
          {t("suggestedResponses") || "Get suggestions"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("startConversationToSeeSuggestions") || "Start a conversation to see suggestions"}
        </p>
      )}
    </div>
  );
};

export default HintButton;
