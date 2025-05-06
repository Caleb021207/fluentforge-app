
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const ProgressPageHeader = () => {
  const { t } = useLocalization();
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        {t("yourLearningProgress")}
      </h1>
    </div>
  );
};

export default ProgressPageHeader;
