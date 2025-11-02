
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { ConversationStartersProps } from "@/types/voiceChat";
import { getTargetLanguagePhrases } from "@/utils/conversationStarterUtils";

const ConversationStarters: React.FC<ConversationStartersProps> = ({ 
  onPhraseClick,
  phrases,
  targetLanguage
}) => {
  const { t } = useLocalization();
  
  // Get phrases in target language (language being learned)
  const defaultPhrases = phrases || getTargetLanguagePhrases(targetLanguage || 'Spanish');

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t("conversationStarters")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base text-muted-foreground mb-6">
          {t("tryThesePhrases")}
        </p>
        <div className="space-y-3">
          {defaultPhrases.map((phrase, index) => (
            <div
              key={index}
              className="w-full text-left py-3 px-4 rounded-md border border-border/50 hover:border-border hover:bg-accent/50 transition-colors cursor-pointer text-base"
              onClick={() => onPhraseClick(phrase)}
            >
              {phrase}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationStarters;
