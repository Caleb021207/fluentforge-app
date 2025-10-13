
import React from "react";
import WritingCertification from "@/components/certifications/WritingCertification";
import TranslatedWritingCertification from "@/components/certifications/TranslatedWritingCertification";
import { useLocalization } from "@/context/LocalizationContext";

const WritingCertificationPage = () => {
  const { currentLanguage } = useLocalization();
  
  // Show appropriate version based on language
  // For Spanish/Portuguese speakers, we show English test
  // For English speakers, we show Spanish test
  const useTranslatedVersion = currentLanguage === "english";

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {currentLanguage === "english" ? "Spanish Writing Test" : "English Writing Test"}
      </h1>
      
      {useTranslatedVersion ? (
        <WritingCertification />
      ) : (
        <TranslatedWritingCertification />
      )}
    </div>
  );
};

export default WritingCertificationPage;
