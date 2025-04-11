
import React from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

interface AIResponseDisplayProps {
  gptResponse: string;
  translation: string;
  isSpeaking: boolean;
  onPlayAgain: () => void;
}

const AIResponseDisplay: React.FC<AIResponseDisplayProps> = ({
  gptResponse,
  translation,
  isSpeaking,
  onPlayAgain
}) => {
  const { currentLanguage, t } = useLocalization();

  if (!gptResponse) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{currentLanguage === "french" ? "Réponse de l'IA" : t("aiResponse")}:</h3>
        <Button 
          onClick={onPlayAgain} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          disabled={isSpeaking}
        >
          <Volume2 className="h-4 w-4" />
          {isSpeaking ? (currentLanguage === "french" ? "En train de parler" : t("speaking")) : 
                       (currentLanguage === "french" ? "Rejouer" : t("playAgain"))}
        </Button>
      </div>
      <div className="bg-lingua-primary/10 rounded-lg p-4 text-gray-800">
        {gptResponse}
        
        {translation && translation.trim() !== "" && (
          <>
            <div className="border-t border-gray-300 my-3"></div>
            <div className="text-sm text-gray-600">
              <strong>{currentLanguage === "french" ? "Traduction" : t("translation")}:</strong> {translation}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIResponseDisplay;
