
import React from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

interface LearnLanguageControlsProps {
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  transcript: string;
  onToggleListening: () => void;
  onSendTranscript: () => void;
  language: string;
}

const LearnLanguageControls: React.FC<LearnLanguageControlsProps> = ({
  isListening,
  isLoading,
  isSpeaking,
  transcript,
  onToggleListening,
  onSendTranscript,
  language
}) => {
  const { t } = useLocalization();

  const getMicButtonText = () => {
    if (isListening) {
      return t("stopListening");
    } else {
      return `Speak in ${language}`;
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div className="mb-4 md:mb-0">
        <p className="text-sm text-gray-500">
          <span className="font-medium">{t("practiceLevel")}: B1</span> - {t("cefrB1Description")}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onToggleListening}
          variant={isListening ? "destructive" : "default"}
          size="lg"
          disabled={isLoading || isSpeaking}
          className="flex items-center gap-2"
          type="button"
          aria-label={isListening ? "Stop listening" : `Start speaking in ${language}`}
        >
          {isListening ? (
            <>
              <MicOff className="h-5 w-5 mr-2" />
              {getMicButtonText()}
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              {getMicButtonText()}
            </>
          )}
        </Button>
        
        {transcript && (
          <Button
            onClick={onSendTranscript}
            variant="default"
            size="lg"
            disabled={isLoading || isSpeaking || !transcript.trim()}
            className="flex items-center gap-2"
            type="button"
          >
            <Send className="h-5 w-5 mr-2" />
            {t("send")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LearnLanguageControls;
