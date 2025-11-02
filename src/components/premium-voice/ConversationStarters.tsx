
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { ConversationStartersProps } from "@/types/voiceChat";
import { getConversationStarters } from "@/utils/conversationStarterUtils";

const ConversationStarters: React.FC<ConversationStartersProps> = ({ 
  onPhraseClick,
  targetLanguage,
  isLoading = false,
  hasMessages = false
}) => {
  const { t, currentLanguage } = useLocalization();
  const [hasUsedStarter, setHasUsedStarter] = useState(false);
  
  // Get phrases with translations in target language
  const starters = getConversationStarters(targetLanguage || 'Spanish');

  // Hide starters if one has been used or if there are already messages
  if (hasUsedStarter || hasMessages) {
    return null;
  }

  const handlePhraseClick = (phrase: string) => {
    if (isLoading || hasUsedStarter) return;
    
    setHasUsedStarter(true);
    onPhraseClick(phrase);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t("conversationStarters")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base text-muted-foreground mb-6">
          {t("tryThesePhrases")}
        </p>
        <div className="space-y-4">
          {starters.map((starter, index) => (
            <div
              key={index}
              className={`w-full text-left py-3 px-4 rounded-md border transition-colors ${
                isLoading 
                  ? 'border-border/30 bg-muted/20 cursor-not-allowed opacity-60' 
                  : 'border-border/50 hover:border-border hover:bg-accent/50 cursor-pointer'
              }`}
              onClick={() => handlePhraseClick(starter.targetPhrase)}
            >
              <div className="text-base font-medium mb-1">
                {starter.targetPhrase}
              </div>
              <div className="text-sm text-muted-foreground">
                {starter.translations[currentLanguage.toLowerCase()] || starter.translations.english}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationStarters;
