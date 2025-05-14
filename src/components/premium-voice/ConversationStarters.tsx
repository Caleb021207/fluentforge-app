
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { ConversationStartersProps } from "@/types/voiceChat";

const ConversationStarters: React.FC<ConversationStartersProps> = ({ 
  onPhraseClick,
  phrases
}) => {
  const { t, currentLanguage } = useLocalization();
  
  // Get default phrases if none provided
  const defaultPhrases = phrases || [
    t("phrase1"),
    t("phrase2"),
    t("phrase3"),
    t("phrase4"),
    t("phrase5"),
    t("phrase6"),
    t("phrase7"),
    t("phrase8")
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("conversationStarters")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t("tryThesePhrases")}
        </p>
        <div className="space-y-2">
          {defaultPhrases.map((phrase, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full justify-start text-left h-auto py-2 font-normal"
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
