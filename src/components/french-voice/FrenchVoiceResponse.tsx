
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface FrenchVoiceResponseProps {
  content: string;
  translation?: string;
  isSpeaking: boolean;
  onPlayAgain: (text: string) => void;
}

const FrenchVoiceResponse = ({
  content,
  translation,
  isSpeaking,
  onPlayAgain
}: FrenchVoiceResponseProps) => {
  const { t } = useLocalization();

  if (!content) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{t("aiResponse")}:</h3>
        <Button 
          onClick={() => onPlayAgain(content)} 
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
        {content}
        {translation && (
          <>
            <div className="border-t border-gray-300 my-3"></div>
            <div className="text-sm text-gray-600">
              <strong>{t("translation")}:</strong> {translation}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FrenchVoiceResponse;
