
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full justify-start text-left h-auto py-3 text-base font-normal"
              onClick={() => onPhraseClick(phrase)}
            >
              {phrase}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationStarters;
