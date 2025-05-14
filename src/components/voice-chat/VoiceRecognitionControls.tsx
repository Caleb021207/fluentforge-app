
import React from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { VoiceRecognitionControlsProps } from "@/types/voiceChat";

const VoiceRecognitionControls: React.FC<VoiceRecognitionControlsProps> = ({
  isListening,
  isLoading,
  isSpeaking,
  transcript,
  toggleListening,
  handleSendTranscript,
}) => {
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
          onClick={() => handleSendTranscript(transcript)}
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

export default VoiceRecognitionControls;
