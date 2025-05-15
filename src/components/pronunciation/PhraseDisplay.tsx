
import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { useVoiceTTS } from "@/hooks/useVoiceTTS";
import WordByWordTTS from "./WordByWordTTS";

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
  const { speakWithAzureTTS, isSpeaking } = useVoiceTTS({ practiceLanguage: "spanish" });

  const handlePlayAudio = () => {
    if (!isSpeaking) {
      setIsPlaying(true);
      speakWithAzureTTS(phrase);
      // We can't use .finally() since the function returns void
      // Instead, rely on the isSpeaking state from the hook
      // The setIsPlaying(false) will happen when the TTS hook sets isSpeaking to false
    }
  };

  React.useEffect(() => {
    // Update isPlaying based on isSpeaking from the hook
    if (!isSpeaking && isPlaying) {
      setIsPlaying(false);
    }
  }, [isSpeaking, isPlaying]);

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
      
      <div className="flex flex-col space-y-4">
        <Button
          onClick={handlePlayAudio}
          disabled={isSpeaking}
          variant="outline"
          className="flex items-center gap-2 w-fit"
        >
          <Volume2 className="h-4 w-4" />
          <span>{isPlaying ? t("playing") : t("listenToPhrase")}</span>
        </Button>
        
        <WordByWordTTS phrase={phrase} speechRate={speechRate} />
      </div>
    </div>
  );
};

export default PhraseDisplay;
