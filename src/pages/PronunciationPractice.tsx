
import React, { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import PronunciationPracticeContainer from "@/components/pronunciation/PronunciationPracticeContainer";

const PronunciationPractice = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-5xl mx-auto p-4 md:p-6">
        <Card className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t("authRequired")}</h1>
            <p>{t("pleaseLoginToAccessThisFeature")}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6">
      <PronunciationPracticeContainer />
    </div>
  );
};

export default PronunciationPractice;
