
import React from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

interface VoiceChatControlsProps {
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  transcript: string;
  onToggleListening: () => void;
  onSendTranscript: () => void;
}

const VoiceChatControls: React.FC<VoiceChatControlsProps> = ({
  isListening,
  isLoading,
  isSpeaking,
  transcript,
  onToggleListening,
  onSendTranscript
}) => {
  const { currentLanguage, t } = useLocalization();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div className="mb-4 md:mb-0">
        <p className="text-sm text-gray-500">
          <span className="font-medium">{currentLanguage === "french" ? "Niveau de pratique" : t("practiceLevel")}: B1</span> - {t("cefrB1Description")}
        </p>
      </div>

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
              {currentLanguage === "french" ? "Arrêter d'écouter" : t("stopListening")}
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              {currentLanguage === "french" ? "Commencer à parler" : t("startSpeaking")}
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
            {currentLanguage === "french" ? "Envoyer" : t("send")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VoiceChatControls;
