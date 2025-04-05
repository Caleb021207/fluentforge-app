
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const EmptyChatState = () => {
  const { t } = useLocalization();
  
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <p className="mb-2 font-medium">{t("startChatting")}</p>
      <p className="text-sm text-center">{t("typeMessageBelow")}</p>
    </div>
  );
};

export default EmptyChatState;
