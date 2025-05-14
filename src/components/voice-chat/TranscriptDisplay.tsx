
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

interface TranscriptDisplayProps {
  transcript: string;
  isListening: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript, isListening }) => {
  const { t } = useLocalization();

  if (!transcript) return null;

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2 text-foreground">
        {t("youSaid")}:
      </h3>
      <div className="bg-muted rounded-lg p-4 text-foreground">
        {transcript}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
