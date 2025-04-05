
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import ConversationList from "./ConversationList";
import { ConversationMessage } from "../hooks/useConversationHistory";

interface ConversationHistoryCardProps {
  conversationHistory: ConversationMessage[];
  conversationEndRef: React.RefObject<HTMLDivElement>;
  clearConversation: () => void;
}

const ConversationHistoryCard: React.FC<ConversationHistoryCardProps> = ({
  conversationHistory,
  conversationEndRef,
  clearConversation
}) => {
  const { t } = useLocalization();
  
  if (conversationHistory.length === 0) {
    return null;
  }
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">
          {t("conversationHistory")}
        </h3>
        <Button 
          onClick={clearConversation}
          variant="outline" 
          size="sm"
        >
          {t("clearConversation")}
        </Button>
      </div>
      
      <ConversationList 
        messages={conversationHistory}
        conversationEndRef={conversationEndRef}
      />
    </Card>
  );
};

export default ConversationHistoryCard;
