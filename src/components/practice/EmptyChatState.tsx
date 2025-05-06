
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const EmptyChatState = () => {
  const { t } = useLocalization();
  
  return (
    <div className="flex flex-col items-center justify-center h-64 text-foreground">
      <p className="mb-2 font-medium">{t("startTextChatting")}</p>
      <p className="text-sm text-center text-muted-foreground">{t("typeMessageBelow")}</p>
    </div>
  );
};

export default EmptyChatState;
