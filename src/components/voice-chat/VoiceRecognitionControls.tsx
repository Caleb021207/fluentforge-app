
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
    <div className="flex gap-4">
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        disabled={isLoading || isSpeaking}
        className="px-10 py-7 text-xl"
      >
        {isListening ? (
          <>
            <MicOff className="h-6 w-6 mr-3" />
            {t("stopListening")}
          </>
        ) : (
          <>
            <Mic className="h-6 w-6 mr-3" />
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
          className="px-10 py-7 text-xl"
        >
          <Send className="h-6 w-6 mr-3" />
          {t("send")}
        </Button>
      )}
    </div>
  );
};

export default VoiceRecognitionControls;
