
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface FrenchVoiceControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReplayLast: () => void;
  hasMessages: boolean;
}

const FrenchVoiceControls = ({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  onReplayLast,
  hasMessages,
}: FrenchVoiceControlsProps) => {
  const { t } = useLocalization();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={isRecording ? onStopRecording : onStartRecording}
        variant={isRecording ? "destructive" : "default"}
        disabled={isProcessing}
        className="flex-1"
      >
        {isRecording ? (
          <>
            <MicOff className="mr-2 h-4 w-4" />
            {t("stopListening")}
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" />
            {t("startSpeaking")}
          </>
        )}
      </Button>

      <Button
        variant="outline"
        onClick={onReplayLast}
        disabled={!hasMessages}
      >
        <Play className="mr-2 h-4 w-4" />
        {t("playAgain")}
      </Button>
    </div>
  );
};

export default FrenchVoiceControls;
