
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';
import { getLanguagePair } from '@/utils/languageUtils';
import englishTranslations from '@/translations/english';
import haitianTranslations from '@/translations/haitian';
import spanishTranslations from '@/translations/spanish';

interface ConversationStartersProps {
  onPhraseClick: (phrase: string) => void;
}

const ConversationStarters: React.FC<ConversationStartersProps> = ({ onPhraseClick }) => {
  const { currentLanguage, t } = useLocalization();
  const { practice, native } = getLanguagePair(currentLanguage);

  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    
    let nativeLanguagePhrases;
    let targetLanguagePhrases;
    
    if (currentLanguage === "haitian") {
      nativeLanguagePhrases = phraseKeys.map(key => haitianTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "english") {
      nativeLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => spanishTranslations[key]);
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
    <div className="space-y-6">
      {/* Native language phrases */}
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
      
      {/* Target language phrases */}
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
  );
};

export default ConversationStarters;
