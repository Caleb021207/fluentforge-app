
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { useVoiceTTS } from "@/hooks/useVoiceTTS";

interface WordByWordTTSProps {
  phrase: string;
  speechRate: number;
}

const WordByWordTTS: React.FC<WordByWordTTSProps> = ({ phrase, speechRate }) => {
  const { t } = useLocalization();
  const { speakWithAzureTTS, isSpeaking } = useVoiceTTS({ practiceLanguage: "spanish" });
  
  // Split phrase into words
  const words = phrase.split(/\s+/).filter(word => word.trim().length > 0);

  const handleWordClick = (word: string) => {
    if (!isSpeaking) {
      speakWithAzureTTS(word);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t("clickWordToHear")}</p>
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => (
          <Button
            key={`${word}-${index}`}
            variant="outline"
            size="sm"
            onClick={() => handleWordClick(word)}
            disabled={isSpeaking}
            className="text-base"
          >
            {word.replace(/[.,!?;:]$/, "")}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WordByWordTTS;
