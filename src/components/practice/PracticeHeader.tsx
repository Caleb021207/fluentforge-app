
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const PracticeHeader: React.FC = () => {
  const { t, currentLanguage } = useLocalization();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {t("textPractice")}
      </h1>
      <p className="text-gray-600 mb-4">
        {t("chatWithAITutor")}
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm">
          {t("noticeTextBasedPractice")}
        </p>
      </div>
    </div>
  );
};

export default PracticeHeader;
