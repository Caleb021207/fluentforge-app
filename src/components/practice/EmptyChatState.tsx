
import React from "react";
import { MessageCircle } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const EmptyChatState = () => {
  const { t } = useLocalization();
  
  return (
    <div className="flex flex-col items-center justify-center h-[40vh] text-center px-4">
      <div className="bg-primary/10 p-3 rounded-full mb-4">
        <MessageCircle className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">{t("startChatting")}</h3>
      <p className="text-muted-foreground max-w-md">
        {t("typeMessageBelow")}
      </p>
    </div>
  );
};

export default EmptyChatState;
