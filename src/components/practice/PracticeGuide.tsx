
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import { BrainCircuit, Globe, GraduationCap, AlertCircle } from "lucide-react";
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
  
  // French-specific guide has been modified to show "coming soon" message
  if (currentLanguage === "english" && targetLanguage === "french") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            French Language Support Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            We're working on adding French language support. Please check back later or try practicing Spanish in the meantime.
          </p>
          
          <div className="text-sm text-gray-500 italic border-t pt-4 mt-2">
            <p>Our team is currently developing comprehensive French language materials to ensure a quality learning experience.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Default guide for other language combinations
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
