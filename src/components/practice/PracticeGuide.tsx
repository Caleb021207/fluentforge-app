
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import { BrainCircuit } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";

interface PracticeGuideProps {
  targetLanguage?: string;
}

const PracticeGuide: React.FC<PracticeGuideProps> = ({ targetLanguage = "spanish" }) => {
  const { t, currentLanguage } = useLocalization();
  
  // Determine which language is being practiced
  const displayLanguage = currentLanguage === "english" 
    ? getLanguageDisplayName(targetLanguage)
    : "English";
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-lingua-primary" />
          {t("practiceGuide", { language: displayLanguage })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          {t("practiceGuideDescription", { language: displayLanguage })}
        </p>
        
        <List className="text-sm text-gray-600 mb-4">
          <ListItem>{t("practiceGuideItem1")}</ListItem>
          <ListItem>{t("practiceGuideItem2")}</ListItem>
          <ListItem>{t("practiceGuideItem3")}</ListItem>
          <ListItem>{t("practiceGuideItem4")}</ListItem>
        </List>
        
        <p className="text-sm text-gray-500 italic">
          {t("practiceDisclaimer")}
        </p>
      </CardContent>
    </Card>
  );
};

export default PracticeGuide;
