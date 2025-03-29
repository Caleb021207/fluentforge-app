
import React from "react";
import ReadingCertification from "@/components/certifications/ReadingCertification";
import TranslatedReadingCertification from "@/components/certifications/TranslatedReadingCertification";
import { useLocalization } from "@/context/LocalizationContext";
import { useParams } from "react-router-dom";

const ReadingCertificationPage = () => {
  const { currentLanguage } = useLocalization();
  const { level } = useParams<{ level?: string }>();
  
  // Show appropriate version based on language
  // For Spanish/Portuguese speakers, we show English test
  // For English speakers, we show Spanish test
  const useTranslatedVersion = currentLanguage === "english";

  // Format the title based on level
  const getTitle = () => {
    const baseTitle = currentLanguage === "english" ? "Spanish Reading Test" : "English Reading Test";
    if (level) {
      return `${level.toUpperCase()} Level ${baseTitle}`;
    }
    return baseTitle;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {getTitle()}
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
