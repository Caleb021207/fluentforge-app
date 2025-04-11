
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getAvailableTargetLanguages } from "@/utils/languageUtils";

const LanguageAvailabilityBanner = () => {
  const { currentLanguage, t } = useLocalization();
  
  // For English speakers, only Spanish and French are supported
  if (currentLanguage === "english") {
    const availableLanguages = getAvailableTargetLanguages(currentLanguage);
    const languageNames = availableLanguages.map(lang => 
      lang.charAt(0).toUpperCase() + lang.slice(1)).join(' and ');
    
    return (
      <div className="bg-blue-50 text-blue-700 px-4 py-2 text-center text-sm rounded-md mb-4">
        Currently, English speakers can learn {languageNames} with our app.
      </div>
    );
  }
  
  // For other language speakers learning English
  return (
    <div className="bg-blue-50 text-blue-700 px-4 py-2 text-center text-sm rounded-md mb-4">
      {t("currentlySupportingEnglish")}
    </div>
  );
};

export default LanguageAvailabilityBanner;
