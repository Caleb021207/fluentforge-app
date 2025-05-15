
import React from "react";
import { useVoiceTTS } from "@/hooks/useVoiceTTS";
import { useLocalization } from "@/context/LocalizationContext";

interface WordByWordTTSProps {
  phrase: string;
  speechRate?: number;
}

const WordByWordTTS: React.FC<WordByWordTTSProps> = ({
  phrase,
  speechRate = 1
}) => {
  const { speakWithAzureTTS } = useVoiceTTS({ practiceLanguage: "spanish" });
  const [activeWordIndex, setActiveWordIndex] = React.useState<number | null>(null);
  const { t } = useLocalization();
  
  // Split the phrase into words
  const words = phrase.split(/\s+/);

  const handleWordClick = (word: string, index: number) => {
    setActiveWordIndex(index);
    speakWithAzureTTS(word);
    // Reset active state after 1 second
    setTimeout(() => setActiveWordIndex(null), 1000);
  };

  return (
    <div className="mt-2">
      <div className="text-sm text-muted-foreground mb-2">{t("clickWordToHear")}</div>
      <div className="flex flex-wrap gap-1">
        {words.map((word, index) => (
          <button
            key={`${word}-${index}`}
            onClick={() => handleWordClick(word, index)}
            className={`px-1 py-0.5 rounded hover:bg-accent/30 transition-colors cursor-pointer border border-transparent
              ${activeWordIndex === index ? "bg-accent text-accent-foreground" : "hover:border-accent/50"}`}
            aria-label={`Pronounce word: ${word}`}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WordByWordTTS;
