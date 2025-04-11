
import React from "react";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface ConversationStartersProps {
  nativeLanguagePhrases: string[];
  targetLanguagePhrases: string[];
  onPhraseClick: (phrase: string) => void;
}

const ConversationStarters: React.FC<ConversationStartersProps> = ({
  nativeLanguagePhrases,
  targetLanguagePhrases,
  onPhraseClick
}) => {
  const { currentLanguage, t } = useLocalization();

  return (
    <Card className="p-6">
      <h3 className="font-medium mb-4">
        {currentLanguage === "french" ? "Suggestions de conversation" : t("conversationStarters")}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {currentLanguage === "french" ? "Essayez ces phrases pour commencer une conversation :" : t("tryThesePhrases")}
      </p>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2 text-lingua-primary">
            {currentLanguage === "french" ? "Dans votre langue cible" : t("inYourTargetLanguage")}: (English)
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
            {currentLanguage === "french" ? "Dans votre langue maternelle" : t("inYourNativeLanguage")}: (French)
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
