
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { TranscriptDisplayProps } from "@/types/voiceChat";

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript, isListening }) => {
  const { t } = useLocalization();

  if (!transcript) return null;

  return (
    <div className="mb-10">
      <h3 className="text-xl md:text-2xl font-medium mb-4 text-foreground">
        {t("youSaid")}:
      </h3>
      <div className="bg-muted rounded-lg p-8 text-xl md:text-2xl text-foreground">
        {transcript}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
