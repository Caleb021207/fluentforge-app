
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
    <div className="flex gap-4 md:gap-6">
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        disabled={isLoading || isSpeaking}
        className="px-12 py-8 text-xl md:text-2xl"
      >
        {isListening ? (
          <>
            <MicOff className="h-7 w-7 mr-3" />
            {t("stopListening")}
          </>
        ) : (
          <>
            <Mic className="h-7 w-7 mr-3" />
            {t("startSpeaking")}
          </>
        )}
      </Button>
      
      {transcript && transcript.trim() && (
        <Button
          onClick={() => handleSendTranscript(transcript)}
          variant="default"
          size="lg"
          disabled={isLoading || isSpeaking}
          className="px-12 py-8 text-xl md:text-2xl"
        >
          <Send className="h-7 w-7 mr-3" />
          {t("send")}
        </Button>
      )}
    </div>
  );
};

export default VoiceRecognitionControls;
