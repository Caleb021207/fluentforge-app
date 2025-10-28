
import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { useDynamicTTS } from "./hooks/useDynamicTTS";
import WordByWordTTS from "./WordByWordTTS";
import { getTargetLanguage } from "@/utils/languageConstants";

interface PhraseDisplayProps {
  phrase: string;
  translation: string;
  topic?: string;
  speechRate?: number;
}

const PhraseDisplay: React.FC<PhraseDisplayProps> = ({ 
  phrase, 
  translation, 
  topic,
  speechRate = 1.0
}) => {
  const { t, currentLanguage } = useLocalization();
  const targetLanguage = getTargetLanguage(currentLanguage);
  
  const tts = useDynamicTTS({
    language: targetLanguage,
    speechRate
  });

  const handlePlayPhrase = () => {
    tts.playText(phrase);
  };

  return (
    <div className="space-y-4">
      {topic && (
        <div className="text-sm text-muted-foreground">
          {t("topic")}: {topic}
        </div>
      )}
      
      <div className="bg-muted/50 p-6 rounded-lg space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xl font-medium text-foreground mb-2">{phrase}</p>
            <p className="text-sm text-muted-foreground">{translation}</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPhrase}
            disabled={tts.isPlaying}
            className="flex items-center gap-2 shrink-0"
          >
            {tts.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {tts.isLoading ? t("loading") : t("play")}
          </Button>
        </div>
        
        <WordByWordTTS phrase={phrase} speechRate={speechRate} />
      </div>
    </div>
  );
};

export default PhraseDisplay;
