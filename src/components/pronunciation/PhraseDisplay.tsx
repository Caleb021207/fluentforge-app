
import React, { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useVoiceTTS } from "@/hooks/useVoiceTTS";
import WordByWordTTS from "./WordByWordTTS";

interface PhraseDisplayProps {
  phrase: string;
  translation: string;
  speechRate: number;
}

const PhraseDisplay: React.FC<PhraseDisplayProps> = ({ 
  phrase, 
  translation,
  speechRate
}) => {
  const { t } = useLocalization();
  const [isPlaying, setIsPlaying] = useState(false);
  const { speakWithAzureTTS } = useVoiceTTS({ practiceLanguage: "spanish" });

  const handlePlayPhrase = () => {
    setIsPlaying(true);
    speakWithAzureTTS(phrase);
    setTimeout(() => setIsPlaying(false), 2000); // Simple timeout to show playing state
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("practicePhrase")}</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePlayPhrase}
          disabled={isPlaying}
          className="flex items-center gap-1"
        >
          <Play className="h-4 w-4" />
          {isPlaying ? t("playing") : t("playPhrase")}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <p className="text-xl font-medium mb-2">{phrase}</p>
          <p className="text-sm text-muted-foreground italic">{translation}</p>
        </CardContent>
      </Card>
      
      <WordByWordTTS 
        phrase={phrase} 
        speechRate={speechRate}
      />
    </div>
  );
};

export default PhraseDisplay;
