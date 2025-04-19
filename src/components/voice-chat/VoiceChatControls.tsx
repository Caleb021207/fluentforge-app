
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { Mic, MicOff, Send } from "lucide-react";

interface VoiceChatControlsProps {
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  transcript: string;
  onToggleListening: () => void;
  onSendTranscript: () => void;
}

export const VoiceChatControls = ({
  isListening,
  isLoading,
  isSpeaking,
  transcript,
  onToggleListening,
  onSendTranscript,
}: VoiceChatControlsProps) => {
  const { t } = useLocalization();

  return (
    <div className="flex gap-2">
      <Button
        onClick={onToggleListening}
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
          onClick={onSendTranscript}
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
