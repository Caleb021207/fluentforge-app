
import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface PhraseDisplayProps {
  phrase: string;
  translation: string;
  speechRate: number;
  topic?: string;
}

const PhraseDisplay: React.FC<PhraseDisplayProps> = ({
  phrase,
  translation,
  speechRate,
  topic
}) => {
  const { t } = useLocalization();
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    
    // Create SpeechSynthesis utterance
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'es-ES'; // Spanish language
    utterance.rate = speechRate;
    
    // Add event listener for when speech ends
    utterance.onend = () => {
      setIsPlaying(false);
    };
    
    // Add event listener for errors
    utterance.onerror = () => {
      setIsPlaying(false);
    };
    
    // Speak the phrase
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      {topic && (
        <div className="text-sm text-muted-foreground">
          {t("topic")}: {topic}
        </div>
      )}
      
      <div className="bg-muted p-4 rounded-md">
        <div className="mb-2 text-xl font-medium">{phrase}</div>
        <div className="text-muted-foreground text-sm">{translation}</div>
      </div>
      
      <div className="flex justify-start">
        <Button
          onClick={handlePlayAudio}
          disabled={isPlaying}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Volume2 className="h-4 w-4" />
          <span>{isPlaying ? t("playing") : t("listenToPhrase")}</span>
        </Button>
      </div>
    </div>
  );
};

export default PhraseDisplay;
