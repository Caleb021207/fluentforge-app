
import React from "react";
import { useDynamicTTS } from "./hooks/useDynamicTTS";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { Volume2, Loader2 } from "lucide-react";
import { getTargetLanguage } from "@/utils/languageConstants";

interface WordByWordTTSProps {
  phrase: string;
  speechRate?: number;
}

const WordByWordTTS: React.FC<WordByWordTTSProps> = ({ phrase, speechRate = 1.0 }) => {
  const { t, currentLanguage } = useLocalization();
  const targetLanguage = getTargetLanguage(currentLanguage);
  const words = phrase.split(/\s+/);
  
  const tts = useDynamicTTS({
    language: targetLanguage,
    speechRate
  });
  
  const handleWordClick = (word: string) => {
    if (tts.isPlaying) return;
    
    // Remove punctuation for TTS
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    
    // Play the word immediately with the current speech rate
    tts.playText(cleanWord);
  };
  
  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground"
        disabled={tts.isPlaying}
      >
        <span>{t("clickWordToHear")}</span>
      </Button>
      
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => {
          const cleanWord = word.replace(/[.,!?;:]/g, '');
          const isCurrentlyPlaying = tts.currentText === cleanWord && tts.isPlaying;
          
          return (
            <Button
              key={`${word}-${index}`}
              variant="outline"
              size="sm"
              disabled={tts.isPlaying}
              onClick={() => handleWordClick(word)}
              className={`${
                isCurrentlyPlaying ? "bg-primary/20" : ""
              } relative`}
            >
              {word}
              {isCurrentlyPlaying && (
                <Loader2 className="h-3 w-3 absolute -top-1 -right-1 animate-spin" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default WordByWordTTS;
