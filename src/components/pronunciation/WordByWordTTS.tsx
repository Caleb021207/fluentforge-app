
import React, { useState } from "react";
import { useTTS } from "@/components/practice/chat-message/hooks/useTTS";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { Volume2, Loader2 } from "lucide-react";

interface WordByWordTTSProps {
  phrase: string;
  speechRate: number;
}

const WordByWordTTS: React.FC<WordByWordTTSProps> = ({ phrase, speechRate }) => {
  const { t } = useLocalization();
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const words = phrase.split(/\s+/);
  
  const tts = useTTS({
    text: activeWord || "",
    language: "spanish"
  });
  
  const handleWordClick = (word: string) => {
    if (tts.isPlaying) return;
    
    setActiveWord(word);
    
    // Remove punctuation for TTS
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    
    // Play the word with the given speech rate
    // Note: This options object isn't used since we're calling tts.playAudio() directly
    
    // Use our TTS hook to play the word
    tts.playAudio();
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
        {words.map((word, index) => (
          <Button
            key={`${word}-${index}`}
            variant="outline"
            size="sm"
            disabled={tts.isPlaying}
            onClick={() => handleWordClick(word)}
            className={`${
              activeWord === word ? "bg-primary/20" : ""
            } relative`}
          >
            {word}
            {activeWord === word && tts.isPlaying && (
              <Loader2 className="h-3 w-3 absolute -top-1 -right-1 animate-spin" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WordByWordTTS;
