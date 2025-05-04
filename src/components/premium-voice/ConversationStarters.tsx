import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/hooks/useLocalization";

const ConversationStarters: React.FC = () => {
  const { t, currentLanguage } = useLocalization();

  const phrases = [
    { id: 1, text: t("phrase1") },
    { id: 2, text: t("phrase2") },
    { id: 3, text: t("phrase3") },
    { id: 4, text: t("phrase4") },
    { id: 5, text: t("phrase5") },
    { id: 6, text: t("phrase6") }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("conversationStarters")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t("tryThesePhrases")}:
        </p>
        <ul className="space-y-2">
          {phrases.map((phrase) => (
            <li key={phrase.id} className="bg-muted rounded p-3 text-sm">
              {phrase.text}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ConversationStarters;
