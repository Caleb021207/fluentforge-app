
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import englishTranslations from "@/translations/english";
import spanishTranslations from "@/translations/spanish";
import portugueseTranslations from "@/translations/portuguese";
import mandarinTranslations from "@/translations/mandarin";
import vietnameseTranslations from "@/translations/vietnamese";
import frenchTranslations from "@/translations/french";
import japaneseTranslations from "@/translations/japanese";
import russianTranslations from "@/translations/russian";
import ukrainianTranslations from "@/translations/ukrainian";
import hindiTranslations from "@/translations/hindi";
import indonesianTranslations from "@/translations/indonesian";

interface ConversationStartersProps {
  onPhraseClick: (phrase: string) => void;
}

const ConversationStarters: React.FC<ConversationStartersProps> = ({ onPhraseClick }) => {
  const { t, currentLanguage } = useLocalization();
  const targetLanguage = localStorage.getItem("targetLanguage");
  const { practice, native } = getLanguagePair(currentLanguage, targetLanguage || undefined);
  
  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    
    let nativeLanguagePhrases;
    let targetLanguagePhrases;
    
    if (currentLanguage === "english") {
      nativeLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
      
      // Check if the target language is French and use French phrases
      if (targetLanguage === "french") {
        targetLanguagePhrases = phraseKeys.map(key => frenchTranslations[key]);
      } else {
        // Default to Spanish if not French
        targetLanguagePhrases = phraseKeys.map(key => spanishTranslations[key]);
      }
    } else if (currentLanguage === "spanish") {
      nativeLanguagePhrases = phraseKeys.map(key => spanishTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "portuguese") {
      nativeLanguagePhrases = phraseKeys.map(key => portugueseTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "mandarin") {
      nativeLanguagePhrases = phraseKeys.map(key => mandarinTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "vietnamese") {
      nativeLanguagePhrases = phraseKeys.map(key => vietnameseTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "french") {
      nativeLanguagePhrases = phraseKeys.map(key => frenchTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "japanese") {
      nativeLanguagePhrases = phraseKeys.map(key => japaneseTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "russian") {
      nativeLanguagePhrases = phraseKeys.map(key => russianTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "ukrainian") {
      nativeLanguagePhrases = phraseKeys.map(key => ukrainianTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "hindi") {
      nativeLanguagePhrases = phraseKeys.map(key => hindiTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "indonesian") {
      nativeLanguagePhrases = phraseKeys.map(key => indonesianTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else {
      nativeLanguagePhrases = phraseKeys.map(key => t(key));
      targetLanguagePhrases = phraseKeys.map(key => {
        const englishPhrase = englishTranslations[key];
        return englishPhrase || key;
      });
    }
    
    return { nativeLanguagePhrases, targetLanguagePhrases };
  };

  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();

  return (
    <Card className="p-6">
      <h3 className="font-medium mb-4">{t("conversationStarters")}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {t("tryThesePhrases")}
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {native}:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nativeLanguagePhrases.map((phrase, index) => (
              <Button 
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-2 px-3"
                onClick={() => onPhraseClick(phrase)}
              >
                {phrase}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {practice}:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {targetLanguagePhrases.map((phrase, index) => (
              <Button 
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-2 px-3 font-normal"
                onClick={() => onPhraseClick(phrase)}
              >
                {phrase}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConversationStarters;
