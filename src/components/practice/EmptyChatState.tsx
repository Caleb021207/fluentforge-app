
import React from "react";
import { MessageCircle } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const EmptyChatState = () => {
  const { t } = useLocalization();

  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft"
      >
        <MessageCircle className="h-7 w-7 text-accent" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold">{t("startTextChatting")}</p>
        <p className="text-sm text-muted-foreground">{t("typeMessageBelow")}</p>
      </div>
    </div>
  );
};

export default EmptyChatState;
