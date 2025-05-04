import React from "react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/hooks/useLocalization";

const ProgressPageHeader = () => {
  const { t } = useLocalization();
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {t("yourLearningProgress")}
      </h1>
    </div>
  );
};

export default ProgressPageHeader;
