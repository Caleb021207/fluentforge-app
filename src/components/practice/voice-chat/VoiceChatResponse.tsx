
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface VoiceChatResponseProps {
  gptResponse: string;
  translation?: string;
  isSpeaking: boolean;
  onPlayAgain: () => void;
}

const VoiceChatResponse = ({
  gptResponse,
  translation,
  isSpeaking,
  onPlayAgain,
}: VoiceChatResponseProps) => {
  const { t, currentLanguage } = useLocalization();

  if (!gptResponse) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{t("aiResponse")}:</h3>
        <Button 
          onClick={onPlayAgain} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          disabled={isSpeaking}
        >
          <Volume2 className="h-4 w-4" />
          {isSpeaking ? t("speaking") : t("playAgain")}
        </Button>
      </div>
      <div className="bg-lingua-primary/10 rounded-lg p-4 text-gray-800">
        {gptResponse}
        
        {((translation && translation.trim() !== "") || currentLanguage === "hindi") && (
          <>
            <div className="border-t border-gray-300 my-3"></div>
            <div className="text-sm text-gray-600">
              <strong>{t("translation")}:</strong> {translation || t("translationNotAvailable")}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceChatResponse;
