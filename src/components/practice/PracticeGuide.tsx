
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import { BrainCircuit, Globe, GraduationCap } from "lucide-react";
import { useLocalization } from "@/hooks/useLocalization";
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
  
  // French-specific guide for English speakers
  if (currentLanguage === "english" && targetLanguage === "french") {
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
  
  // For Tagalog users practicing English
  if (currentLanguage === "tagalog") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-lingua-primary" />
            {t("englishPracticeGuide")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {t("hereAreSomeTips")}
          </p>
          
          <List className="text-sm text-gray-600 mb-4">
            <ListItem className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>{t("tryToFormCompleteSentences")}</span>
            </ListItem>
            <ListItem className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>{t("dontWorryAboutMakingMistakes")}</span>
            </ListItem>
            <ListItem className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>{t("askForClarification")}</span>
            </ListItem>
            <ListItem className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>{t("tryToUseVocabulary")}</span>
            </ListItem>
          </List>
          
          <p className="text-sm text-gray-500 italic">
            {t("ourAIWillAdapt")}
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
          <ListItem className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <span>{t("practiceGuideItem1")}</span>
          </ListItem>
          <ListItem className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <span>{t("practiceGuideItem2")}</span>
          </ListItem>
          <ListItem className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <span>{t("practiceGuideItem3")}</span>
          </ListItem>
          <ListItem className="flex items-start gap-2">
            <Globe className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <span>{t("practiceGuideItem4")}</span>
          </ListItem>
        </List>
        
        <p className="text-sm text-gray-500 italic">
          {t("practiceDisclaimer")}
        </p>
      </CardContent>
    </Card>
  );
};

export default PracticeGuide;
