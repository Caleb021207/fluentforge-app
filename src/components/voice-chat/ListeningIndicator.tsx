
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { ListeningIndicatorProps } from "@/types/voiceChat";

const ListeningIndicator: React.FC<ListeningIndicatorProps> = ({ isListening }) => {
  const { t } = useLocalization();

  if (!isListening) return null;

  return (
    <div className="text-base text-muted-foreground animate-pulse mb-6">
      {t("listeningNow")}...
    </div>
  );
};

export default ListeningIndicator;
