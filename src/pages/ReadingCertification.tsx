
import React from "react";
import ReadingCertification from "@/components/certifications/ReadingCertification";
import TranslatedReadingCertification from "@/components/certifications/TranslatedReadingCertification";
import { useLocalization } from "@/context/LocalizationContext";

const ReadingCertificationPage = () => {
  const { currentLanguage } = useLocalization();
  
  // Show appropriate version based on language
  // For Spanish/Portuguese speakers, we show English test
  // For English speakers, we show Spanish test
  const useTranslatedVersion = currentLanguage === "english";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {currentLanguage === "english" ? "Spanish Reading Test" : "English Reading Test"}
      </h1>
      
      {useTranslatedVersion ? (
        <ReadingCertification />
      ) : (
        <TranslatedReadingCertification />
      )}
    </div>
  );
};

export default ReadingCertificationPage;
