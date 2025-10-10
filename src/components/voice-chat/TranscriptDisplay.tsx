
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { TranscriptDisplayProps } from "@/types/voiceChat";

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript, isListening }) => {
  const { t } = useLocalization();

  if (!transcript) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-3 text-foreground">
        {t("youSaid")}:
      </h3>
      <div className="bg-muted rounded-lg p-6 text-lg text-foreground">
        {transcript}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
