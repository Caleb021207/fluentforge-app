
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import { getTranslationsForLanguage } from "@/utils/translationUtils";

interface ConversationStartersProps {
  onPhraseClick: (phrase: string) => void;
}

export const ConversationStarters = ({ onPhraseClick }: ConversationStartersProps) => {
  const { t, currentLanguage } = useLocalization();
  const { practice, native } = getLanguagePair(currentLanguage);
  
  const getNativeAndTargetPhrases = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    const nativeTranslations = getTranslationsForLanguage(currentLanguage);
    const targetTranslations = getTranslationsForLanguage("english");
    
    return {
      nativePhrases: phraseKeys.map(key => nativeTranslations[key] || key),
      targetPhrases: phraseKeys.map(key => targetTranslations[key] || key)
    };
  };

  const { nativePhrases, targetPhrases } = getNativeAndTargetPhrases();

  return (
    <Card className="p-6">
      <h3 className="font-medium mb-4">{t("conversationStarters")}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {t("tryThesePhrases")}
      </p>
      
      <div className="space-y-6">
        {/* Native language phrases */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {native}:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nativePhrases.map((phrase, index) => (
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
            {targetPhrases.map((phrase, index) => (
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
