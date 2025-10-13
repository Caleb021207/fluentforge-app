
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

  // Format the title based on level and language
  const getTitle = () => {
    // For Spanish/Portuguese speakers, show "English Reading Test"
    // For English speakers, show "Spanish Reading Test"
    const baseTitle = currentLanguage === "english" ? "Spanish Reading Test" : "English Reading Test";
    if (level) {
      return `${level.toUpperCase()} Level ${baseTitle}`;
    }
    return baseTitle;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {getTitle()}
      </h1>
      
      {useTranslatedVersion ? (
        <TranslatedReadingCertification />
      ) : (
        <ReadingCertification />
      )}
    </div>
  );
};

export default ReadingCertificationPage;
