
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import { BrainCircuit, Globe, GraduationCap, AlertCircle, MessageSquare, BookOpen } from "lucide-react";
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
            We're actively developing our French language curriculum and conversational AI. Please check back soon for a complete French learning experience, or try practicing Spanish, Portuguese, or another supported language in the meantime.
          </p>
          
          <div className="text-sm text-gray-500 italic border-t pt-4 mt-2">
            <p>Our team of linguists and AI specialists is currently developing comprehensive French language materials with native speaker audio to ensure an authentic, high-quality learning experience.</p>
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
          {t("practiceGuide", { language: displayLanguage }) || `${displayLanguage} Practice Guide`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          {t("practiceGuideDescription", { language: displayLanguage }) || 
           `Here are some effective strategies to help you maximize your ${displayLanguage} practice sessions and make consistent progress:`}
        </p>
        
        <List className="text-sm text-gray-600 mb-4">
          <ListItem>
            <BookOpen className="h-4 w-4 mr-2 text-lingua-primary" />
            {t("practiceGuideItem1") || "Try to form complete sentences, even if they're simple. This builds your grammatical fluency faster than single-word responses."}
          </ListItem>
          <ListItem>
            <MessageSquare className="h-4 w-4 mr-2 text-lingua-primary" />
            {t("practiceGuideItem2") || "Don't worry about making mistakes - they're an essential part of the learning process! Our AI tutor will help you improve gradually."}
          </ListItem>
          <ListItem>
            <GraduationCap className="h-4 w-4 mr-2 text-lingua-primary" />
            {t("practiceGuideItem3") || "Ask for clarification if you don't understand something. Learning to navigate confusion is an important language skill."}
          </ListItem>
          <ListItem>
            <Globe className="h-4 w-4 mr-2 text-lingua-primary" />
            {t("practiceGuideItem4") || "Try to incorporate vocabulary you've recently learned into your conversations. This helps solidify new words in your memory."}
          </ListItem>
          <ListItem>
            <BrainCircuit className="h-4 w-4 mr-2 text-lingua-primary" />
            {t("practiceGuideItem5") || "Practice with different topics to expand your vocabulary range and comfort with various conversational contexts."}
          </ListItem>
        </List>
        
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-600 italic">
            {t("practiceDisclaimer") || 
             "Our AI tutor will adapt intelligently to your skill level, providing appropriate challenges while building your confidence. Each practice session strengthens your neural pathways for language, improving both fluency and comprehension over time."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeGuide;
