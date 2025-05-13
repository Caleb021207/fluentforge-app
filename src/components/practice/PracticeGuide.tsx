
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Check, CircleHelp, MessageCircle, Pencil } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface PracticeGuideProps {
  targetLanguage: string;
}

const PracticeGuide = ({ targetLanguage }: PracticeGuideProps) => {
  const { t } = useLocalization();
  
  // Language display name with proper capitalization
  const displayLanguage = targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1);
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5 text-primary" />
          {t("practiceGuide", { language: displayLanguage })}
        </CardTitle>
        <CardDescription>
          {t("practiceGuideDescription", { language: displayLanguage })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span>{t("practiceTip1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span>{t("practiceTip2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <CircleHelp className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <span>{t("practiceTip3")}</span>
          </li>
          <li className="flex items-start gap-2">
            <Pencil className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <span>{t("practiceTip4")}</span>
          </li>
          <li className="flex items-start gap-2">
            <MessageCircle className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
            <span>{t("practiceTip5")}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default PracticeGuide;
