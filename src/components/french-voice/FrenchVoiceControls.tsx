
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface FrenchVoiceControlsProps {
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  transcript: string;
  toggleListening: () => void;
  onSendTranscript: (text: string) => void;
}

const FrenchVoiceControls = ({
  isListening,
  isLoading,
  isSpeaking,
  transcript,
  toggleListening,
  onSendTranscript
}: FrenchVoiceControlsProps) => {
  const { t } = useLocalization();

  return (
    <div className="flex gap-2">
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        disabled={isLoading || isSpeaking}
      >
        {isListening ? (
          <>
            <MicOff className="h-5 w-5 mr-2" />
            {t("stopListening")}
          </>
        ) : (
          <>
            <Mic className="h-5 w-5 mr-2" />
            {t("startSpeaking")}
          </>
        )}
      </Button>
      
      {isListening && transcript && (
        <Button
          onClick={() => onSendTranscript(transcript)}
          variant="default"
          size="lg"
          disabled={isLoading || isSpeaking || !transcript.trim()}
        >
          <Send className="h-5 w-5 mr-2" />
          {t("send")}
        </Button>
      )}
    </div>
  );
};

export default FrenchVoiceControls;
