
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

interface TranscriptDisplayProps {
  transcript: string;
  isListening: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript, isListening }) => {
  const { currentLanguage, t } = useLocalization();

  if (!transcript && !isListening) return null;

  return (
    <>
      {isListening && (
        <div className="text-sm text-gray-500 animate-pulse mb-4">
          {currentLanguage === "french" ? "Écoute en cours..." : t("listeningNow")}...
        </div>
      )}

      {transcript && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">{currentLanguage === "french" ? "Vous avez dit" : t("youSaid")}:</h3>
          <div className="bg-gray-100 rounded-lg p-4 text-gray-800">
            {transcript}
          </div>
        </div>
      )}
    </>
  );
};

export default TranscriptDisplay;
