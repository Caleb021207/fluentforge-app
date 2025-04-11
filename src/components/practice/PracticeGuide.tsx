
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import { BrainCircuit, Globe, GraduationCap } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";

interface PracticeGuideProps {
  targetLanguage?: string;
}

const PracticeGuide: React.FC<PracticeGuideProps> = ({ targetLanguage }) => {
  const { t, currentLanguage } = useLocalization();
  const [storedTargetLanguage, setStoredTargetLanguage] = useState<string | null>(null);
  
  useEffect(() => {
    // If no targetLanguage prop is provided, try to get it from localStorage
    if (!targetLanguage) {
      const stored = localStorage.getItem("targetLanguage");
      setStoredTargetLanguage(stored);
    }
  }, [targetLanguage]);
  
  // Use provided targetLanguage prop if available, otherwise use the one from localStorage
  const effectiveTargetLanguage = targetLanguage || storedTargetLanguage || "spanish";
  
  // Determine which language is being practiced
  const displayLanguage = currentLanguage === "english" 
    ? getLanguageDisplayName(effectiveTargetLanguage)
    : "English";
  
  // French-specific guide for English speakers
  if (currentLanguage === "english" && effectiveTargetLanguage === "french") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-lingua-primary" />
            French Practice Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Practice your French conversation skills with our AI tutor. Here are some suggestions:
          </p>
          
          <List className="text-sm text-gray-600 mb-4">
            <ListItem className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Practice French greetings and introductions: <i>"Bonjour, comment allez-vous?"</i></span>
            </ListItem>
            <ListItem className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Ask about French grammar rules, like when to use <i>"tu"</i> vs <i>"vous"</i></span>
            </ListItem>
            <ListItem className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Practice ordering food or asking for directions in French</span>
            </ListItem>
            <ListItem className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Discuss French culture, cuisine, or travel destinations</span>
            </ListItem>
          </List>
          
          <p className="text-sm text-gray-500 italic">
            The AI will help correct your grammar and vocabulary as you practice.
          </p>
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
