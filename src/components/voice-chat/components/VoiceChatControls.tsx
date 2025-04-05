
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface VoiceChatControlsProps {
  isListening: boolean;
  toggleListening: () => void;
  isLoading: boolean;
  isSpeaking: boolean;
  cefrDescription: string;
  practiceLevelText: string;
}

const VoiceChatControls: React.FC<VoiceChatControlsProps> = ({
  isListening,
  toggleListening,
  isLoading,
  isSpeaking,
  cefrDescription,
  practiceLevelText
}) => {
  const { t } = useLocalization();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div className="mb-4 md:mb-0">
        <p className="text-sm text-gray-500">
          <span className="font-medium">{practiceLevelText}: B1</span> - {cefrDescription}
        </p>
      </div>

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
    </div>
  );
};

export default VoiceChatControls;
