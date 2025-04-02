
import React from "react";
import { MessageCircle } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const EmptyChatState: React.FC = () => {
  const { t } = useLocalization();

  return (
    <div className="text-center py-8 text-gray-500">
      <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
      <p>{t("startTextChatting")}</p>
      <p className="text-sm mt-2">
        {t("typeMessageBelow")}
      </p>
    </div>
  );
};

export default EmptyChatState;
