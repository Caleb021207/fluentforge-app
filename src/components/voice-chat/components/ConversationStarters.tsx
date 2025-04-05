
import React from "react";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { useLanguagePair } from "../hooks/useLanguagePair";
import englishTranslations from "@/translations/english";
import spanishTranslations from "@/translations/spanish";
import portugueseTranslations from "@/translations/portuguese";
import mandarinTranslations from "@/translations/mandarin";
import vietnameseTranslations from "@/translations/vietnamese";
import frenchTranslations from "@/translations/french";
import japaneseTranslations from "@/translations/japanese";
import russianTranslations from "@/translations/russian";

interface ConversationStartersProps {
  onPhraseClick: (phrase: string) => void;
}

const ConversationStarters: React.FC<ConversationStartersProps> = ({ 
  onPhraseClick 
}) => {
  const { t, currentLanguage } = useLocalization();
  const { getLanguagePair } = useLanguagePair();
  const { practice, native } = getLanguagePair();
  
  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    
    let nativeLanguagePhrases;
    let targetLanguagePhrases;
    
    if (currentLanguage === "english") {
      nativeLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => spanishTranslations[key]);
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
        <div>
          <h4 className="text-sm font-medium mb-2 text-lingua-primary">
            {t("inYourTargetLanguage")}: ({practice})
          </h4>
          <ul className="space-y-2">
            {targetLanguagePhrases.map((phrase, index) => (
              <li 
                key={`target-${index}`} 
                className="text-sm p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => onPhraseClick(phrase)}
              >
                {phrase}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2 text-lingua-primary">
            {t("inYourNativeLanguage")}: ({native})
          </h4>
          <ul className="space-y-2">
            {nativeLanguagePhrases.map((phrase, index) => (
              <li 
                key={`native-${index}`} 
                className="text-sm p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => onPhraseClick(phrase)}
              >
                {phrase}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default ConversationStarters;
